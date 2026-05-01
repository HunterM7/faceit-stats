import { useEffect, useState } from 'react'
import { StatsWidgetCard } from '@components/stats-widget-card/stats-widget-card'
import { requestStats, type StatsPayload } from '@requests/stats'
import { formatNumberWithFixedDecimals } from '@/utils/number-format'

const PREVIEW_SOURCE = 'stats_widget' as const

type PreviewStatus =
  | { status: 'idle' }
  | { status: 'loading'; forNickname: string }
  | { status: 'error'; forNickname: string; message: string }
  | { status: 'ready'; forNickname: string; stats: StatsPayload }

function mapStatsPayloadToWidgetProps(stats: StatsPayload) {
  const countryCode = (stats.country || '').toLowerCase()
  const dailyAvgKillsAdr =
    `${formatNumberWithFixedDecimals(stats.daily.averageKills, 0)} / ${formatNumberWithFixedDecimals(stats.daily.averageAdr, 0)}`
  const monthlyAvgKillsAdr =
    `${formatNumberWithFixedDecimals(stats.last30.averageKills, 0)} / ${formatNumberWithFixedDecimals(stats.last30.averageAdr, 0)}`
  const monthlyKdKr =
    `${formatNumberWithFixedDecimals(stats.last30.kdRatio, 2)} / ${formatNumberWithFixedDecimals(stats.last30.krRatio, 2)}`

  return {
    common: {
      levelValue: stats.common.skillLevel,
      eloValue: stats.common.faceitElo,
      kdRatioValue: stats.common.kdRatio,
      countryCode,
      rankLabel: stats.common.rankLabel,
    },
    daily: {
      todayWins: stats.daily.wins,
      todayLosses: stats.daily.losses,
      avgKillsAdr: dailyAvgKillsAdr,
      kdRatioValue: stats.daily.kdRatio,
    },
    monthly: {
      winRateValue: `${stats.last30.winRate}%`,
      avgKillsAdr: monthlyAvgKillsAdr,
      kdKr: monthlyKdKr,
    },
  }
}

type StatsWidgetPagePreviewProps = {
  nickname: string;
  backgroundOpacityPercent: number;
  borderRadius: number;
}

export function StatsWidgetPagePreview(props: StatsWidgetPagePreviewProps) {
  const { nickname, backgroundOpacityPercent, borderRadius } = props
  const trimmedNickname = nickname.trim()
  const [ preview, setPreview ] = useState<PreviewStatus>({ status: 'idle' })

  useEffect(() => {
    if (!trimmedNickname.length) {
      return
    }

    const forNickname = trimmedNickname
    let cancelled = false

    void (async () => {
      await Promise.resolve()
      if (cancelled) {
        return
      }
      setPreview({ status: 'loading', forNickname })

      try {
        const stats = await requestStats(forNickname, PREVIEW_SOURCE)
        if (cancelled) {
          return
        }
        setPreview({ status: 'ready', forNickname, stats })
      } catch (error: unknown) {
        if (cancelled) {
          return
        }
        const message = error instanceof Error ? error.message : 'Не удалось загрузить данные'
        setPreview({ status: 'error', forNickname, message })
      }
    })()

    return () => {
      cancelled = true
    }
  }, [ trimmedNickname ])

  if (!trimmedNickname.length) {
    return (
      <div className='stats-widget-page__preview'>
        <p className='stats-widget-page__preview-placeholder'>
          Укажи ник FACEIT слева — предпросмотр обновится одним запросом.
        </p>
      </div>
    )
  }

  const isStale = (nick: string) => nick !== trimmedNickname

  if (preview.status === 'loading' && !isStale(preview.forNickname)) {
    return (
      <div className='stats-widget-page__preview'>
        <p className='stats-widget-page__preview-placeholder' aria-live='polite'>
          Загрузка предпросмотра…
        </p>
      </div>
    )
  }

  if (preview.status === 'error' && !isStale(preview.forNickname)) {
    return (
      <div className='stats-widget-page__preview'>
        <p className='stats-widget-page__preview-placeholder stats-widget-page__preview-placeholder--error' role='alert'>
          {preview.message}
        </p>
      </div>
    )
  }

  if (preview.status === 'ready' && !isStale(preview.forNickname)) {
    const cardProps = mapStatsPayloadToWidgetProps(preview.stats)

    return (
      <div className='stats-widget-page__preview'>
        <div className='stats-widget-page__preview-stage'>
          <StatsWidgetCard
            {...cardProps}
            backgroundOpacityPercent={backgroundOpacityPercent}
            borderRadius={borderRadius}
            className='stats-widget-page__preview-card'
          />
        </div>
      </div>
    )
  }

  return (
    <div className='stats-widget-page__preview'>
      <p className='stats-widget-page__preview-placeholder' aria-live='polite'>
        Загрузка предпросмотра…
      </p>
    </div>
  )
}
