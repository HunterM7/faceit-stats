import { WidgetStatistics } from '@widgets/widget-statistics/widget-statistics'
import type { StatsPayload, Rank, StatsRatingQuery } from '@requests/stats'
import type { ComponentProps } from 'react';

export type StatsWidgetPagePreviewState =
  | { kind: 'empty' }
  | { kind: 'loading'; nickname: string }
  | { kind: 'error'; nickname: string; message: string }
  | { kind: 'ready'; nickname: string; stats: StatsPayload };

function filterRankForRatingMode(rank: Rank, mode: StatsRatingQuery): Rank {
  if (mode === 'both') {
    return { ...rank }
  }
  if (mode === 'country') {
    return rank.country ? { country: rank.country } : {}
  }
  return rank.region ? { region: rank.region } : {}
}

function mapStatsPayloadToWidgetProps(stats: StatsPayload, ratingMode: StatsRatingQuery): ComponentProps<typeof WidgetStatistics> {
  return {
    common: {
      level: stats.common.skillLevel,
      elo: stats.common.faceitElo,
      kd: stats.common.kd,
      rank: filterRankForRatingMode(stats.common.rank, ratingMode),
    },
    daily: {
      wins: stats.daily.wins,
      losses: stats.daily.losses,
      avg: stats.daily.averageKills,
      adr: stats.daily.averageAdr,
      kd: stats.daily.kd,
    },
    monthly: {
      winRatePercent: stats.last30.winRate,
      results: stats.last30.matchResults ?? [],
      avg: stats.last30.averageKills,
      adr: stats.last30.averageAdr,
      kd: stats.last30.kd,
      kr: stats.last30.krRatio,
    },
  }
}

type StatsWidgetPagePreviewProps = {
  preview: StatsWidgetPagePreviewState;
  ratingMode: StatsRatingQuery;
  backgroundOpacity: number;
  borderRadius: number;
}

export function StatsWidgetPagePreview(props: StatsWidgetPagePreviewProps) {
  const { preview, ratingMode, backgroundOpacity, borderRadius } = props

  if (preview.kind === 'empty') {
    return (
      <div className='stats-widget-page__preview'>
        <p className='stats-widget-page__preview-placeholder'>
          Укажи ник на FACEIT.
        </p>
      </div>
    )
  }

  if (preview.kind === 'loading') {
    return (
      <div className='stats-widget-page__preview'>
        <p className='stats-widget-page__preview-placeholder' aria-live='polite'>
          Загрузка предпросмотра…
        </p>
      </div>
    )
  }

  if (preview.kind === 'error') {
    return (
      <div className='stats-widget-page__preview'>
        <p className='stats-widget-page__preview-placeholder stats-widget-page__preview-placeholder--error' role='alert'>
          {preview.message}
        </p>
      </div>
    )
  }

  const cardProps = mapStatsPayloadToWidgetProps(preview.stats, ratingMode)

  return (
    <div className='stats-widget-page__preview'>
      <div className='stats-widget-page__preview-stage'>
        <WidgetStatistics
          {...cardProps}
          backgroundOpacity={backgroundOpacity}
          borderRadius={borderRadius}
          className='stats-widget-page__preview-card'
        />
      </div>
    </div>
  )
}
