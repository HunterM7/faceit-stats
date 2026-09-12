import { type ComponentRef, useEffect, useRef, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { lastMatch, player } from '@/requests/matchResult';
import { WidgetOverlay } from '@widgets/widget-overlay/widget-overlay';
import type { OverlayMatchResult, OverlayMatchSnapshot } from '@widgets/widget-overlay/overlay-test-flow';
import { useOverlayTestMatchCycle } from '@widgets/widget-overlay/use-overlay-test-match-cycle';
import './overlay-page.scss';

function overlayResultFromApi(result: string | undefined): 'WIN' | 'LOSS' {
  if (result === 'LOSS') {
    return 'LOSS';
  }
  return 'WIN';
}

const analyticsSource = 'overlay_widget';
const pollMs = 1500;
/** FACEIT часто отдаёт старый ELO сразу после матча — ждём смену, не списывая ID. */
const eloLagRetryMs = 40000;

function isPlayerNotFoundError(error: unknown): boolean {
  return typeof error === 'object'
    && error !== null
    && 'status' in error
    && (error as { status: unknown }).status === 404;
}

export function OverlayPage() {
  const location = useLocation();
  const [ searchParams, setSearchParams ] = useSearchParams();
  const rawNickname = searchParams.get('nickname');
  const rawTest = searchParams.get('test');
  const isTestMode = rawTest === 'true';
  const nickname = rawNickname?.trim() ?? '';
  const missingNicknameMessage = !isTestMode && !nickname
    ? 'Похоже, что ты не указал свой FACEIT-ник. Добавь его в адресной строке после nickname='
    : null;

  const testCycle = useOverlayTestMatchCycle(isTestMode);
  const [ overlayMatch, setOverlayMatch ] = useState<OverlayMatchResult | null>(null);
  const [ overlayPreviousMatch, setOverlayPreviousMatch ] = useState<OverlayMatchSnapshot | null>(null);
  const [ overlayLoadError, setOverlayLoadError ] = useState<string | null>(null);

  useEffect(() => {
    const nextParams = new URLSearchParams();
    if (rawNickname !== null || !isTestMode) {
      nextParams.set('nickname', rawNickname ?? '');
    }
    if (rawTest !== null) {
      nextParams.set('test', rawTest === 'true' ? 'true' : 'false');
    }

    const hasNicknameWithoutEquals = /(?:\?|&)nickname(?:&|$)/.test(location.search);
    const hasTestWithoutEquals = /(?:\?|&)test(?:&|$)/.test(location.search);
    if (hasNicknameWithoutEquals || hasTestWithoutEquals || nextParams.toString() !== searchParams.toString()) {
      setSearchParams(nextParams, { replace: true });
      return;
    }

    if (isTestMode) {
      const resetLoadErrorRaf = window.requestAnimationFrame(() => {
        setOverlayLoadError(null);
      });
      return () => {
        window.cancelAnimationFrame(resetLoadErrorRaf);
      };
    }

    if (!nickname) {
      let cancelledLocal = false;
      const frameId = window.requestAnimationFrame(() => {
        if (!cancelledLocal) {
          setOverlayMatch(null);
          setOverlayPreviousMatch(null);
          setOverlayLoadError(null);
        }
      });
      return () => {
        cancelledLocal = true;
        window.cancelAnimationFrame(frameId);
      };
    }

    let lastMatchId: string | null = null;
    let lastKnownElo: number | null = null;
    let lastKnownLevel: number | null = null;
    let playerId: string | null = null;
    let pollTimer: number | null = null;
    let retryTimer: number | null = null;
    let cancelled = false;
    let eloWaitStartedAt = 0;
    let eloWaitMatchId: string | null = null;

    const resetLoadErrorRaf = window.requestAnimationFrame(() => {
      if (!cancelled) {
        setOverlayLoadError(null);
      }
    });

    const publishMatch = (previous: OverlayMatchSnapshot | null, payload: OverlayMatchResult) => {
      setOverlayPreviousMatch(previous);
      setOverlayMatch(payload);
    };

    const pollLastMatch = async () => {
      try {
        if (!playerId) {
          return;
        }
        if (cancelled) {
          return;
        }
        const matchData = await lastMatch(playerId, analyticsSource);

        if (!lastMatchId) {
          lastMatchId = matchData.matchId;
          return;
        }
        if (!matchData.matchId || matchData.matchId === lastMatchId) {
          return;
        }

        const playerPayload = await player(nickname, analyticsSource);
        if (cancelled) {
          return;
        }

        const nextElo = typeof playerPayload.currentElo === 'number' ? playerPayload.currentElo : null;
        const nextLevel =
          typeof playerPayload.currentSkillLevel === 'number' ? playerPayload.currentSkillLevel : null;
        const previousElo = lastKnownElo;
        const snapshotLevel = lastKnownLevel;

        if (typeof nextElo !== 'number' || typeof previousElo !== 'number') {
          return;
        }

        if (nextElo === previousElo) {
          if (eloWaitMatchId !== matchData.matchId) {
            eloWaitMatchId = matchData.matchId;
            eloWaitStartedAt = Date.now();
          }
          if (Date.now() - eloWaitStartedAt < eloLagRetryMs) {
            return;
          }
        }

        eloWaitMatchId = null;
        eloWaitStartedAt = 0;
        lastMatchId = matchData.matchId;
        lastKnownElo = nextElo;
        if (typeof nextLevel === 'number') {
          lastKnownLevel = nextLevel;
        }

        publishMatch(
          {
            elo: previousElo,
            skillLevel: snapshotLevel,
          },
          {
            elo: nextElo,
            skillLevel: typeof nextLevel === 'number' ? nextLevel : snapshotLevel,
            result: overlayResultFromApi(matchData.result),
          },
        );
      } catch {
        // Держим последний успешный оверлей при временных ошибках поллинга.
      }
    };

    const startPolling = () => {
      if (cancelled || pollTimer !== null) {
        return;
      }
      pollTimer = window.setInterval(() => void pollLastMatch(), pollMs);
    };

    const bootstrap = () => {
      player(nickname, analyticsSource)
        .then((playerPayload) => {
          if (cancelled) {
            return;
          }
          playerId = typeof playerPayload.playerId === 'string' ? playerPayload.playerId : null;
          if (!playerId) {
            setOverlayLoadError('Игрок не найден. Проверьте никнейм FACEIT.');
            return;
          }
          lastKnownElo = typeof playerPayload.currentElo === 'number' ? playerPayload.currentElo : null;
          lastKnownLevel = typeof playerPayload.currentSkillLevel === 'number' ? playerPayload.currentSkillLevel : null;
          return lastMatch(playerId, analyticsSource);
        })
        .then((matchData) => {
          if (cancelled || !playerId) {
            return;
          }
          if (matchData?.matchId) {
            lastMatchId = matchData.matchId;
          }
          startPolling();
        })
        .catch((error: unknown) => {
          if (cancelled) {
            return;
          }
          if (playerId) {
            startPolling();
            return;
          }
          if (isPlayerNotFoundError(error) && error instanceof Error) {
            setOverlayLoadError(error.message);
            return;
          }
          retryTimer = window.setTimeout(() => void bootstrap(), pollMs);
        });
    };

    void bootstrap();

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(resetLoadErrorRaf);
      if (pollTimer) {
        window.clearInterval(pollTimer);
      }
      if (retryTimer) {
        window.clearTimeout(retryTimer);
      }
      window.requestAnimationFrame(() => {
        setOverlayMatch(null);
        setOverlayPreviousMatch(null);
      });
    };
  }, [
    isTestMode,
    location.search,
    nickname,
    rawNickname,
    rawTest,
    searchParams,
    setSearchParams,
  ]);

  const blockingMessage = missingNicknameMessage ?? overlayLoadError;
  const activeMatch = isTestMode ? (testCycle?.match ?? null) : overlayMatch;
  const activePreviousMatch = isTestMode ? (testCycle?.previousMatch ?? null) : overlayPreviousMatch;

  const widgetOverlayRef = useRef<ComponentRef<typeof WidgetOverlay>>(null);

  useEffect(() => {
    if (blockingMessage) {
      return;
    }

    if (!activeMatch) {
      if (isTestMode && testCycle) {
        widgetOverlayRef.current?.showMatchResult({ result: testCycle.result });
      }
      return;
    }

    widgetOverlayRef.current?.showMatchResult({
      previous: activePreviousMatch
        && typeof activePreviousMatch.elo === 'number'
        && typeof activePreviousMatch.skillLevel === 'number'
        ? { elo: activePreviousMatch.elo, skillLevel: activePreviousMatch.skillLevel }
        : undefined,
      current: typeof activeMatch.elo === 'number' && typeof activeMatch.skillLevel === 'number'
        ? { elo: activeMatch.elo, skillLevel: activeMatch.skillLevel }
        : undefined,
      result: activeMatch.result,
    });
  }, [ activeMatch, activePreviousMatch, blockingMessage, isTestMode, testCycle ]);

  return (
    <div className='overlay-page'>
      {blockingMessage ? (
        <div className='overlay-page__error-screen'>
          <div className='overlay-page__error-title'>Упс, не нашли такого игрока</div>
          <div className='overlay-page__error-message'>{blockingMessage}</div>
        </div>
      ) : (
        <WidgetOverlay ref={widgetOverlayRef}/>
      )}
    </div>
  );
}
