import { StatsWidgetCard } from '@components/stats-widget-card/stats-widget-card'
import type { StatsPayload, StatsRankBlock, StatsRatingQuery } from '@requests/stats'
import { formatNumberWithFixedDecimals } from '@/utils/number-format'

export type StatsWidgetPagePreviewState =
  | { kind: 'empty' }
  | { kind: 'loading'; nickname: string }
  | { kind: 'error'; nickname: string; message: string }
  | { kind: 'ready'; nickname: string; stats: StatsPayload };

function filterRankForRatingMode(rank: StatsRankBlock, mode: StatsRatingQuery): StatsRankBlock {
  if (mode === 'both') {
    return { ...rank }
  }
  if (mode === 'country') {
    return rank.country ? { country: rank.country } : {}
  }
  return rank.region ? { region: rank.region } : {}
}

function mapStatsPayloadToWidgetProps(stats: StatsPayload, ratingMode: StatsRatingQuery) {
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
      rank: filterRankForRatingMode(stats.common.rank, ratingMode),
    },
    daily: {
      todayWins: stats.daily.wins,
      todayLosses: stats.daily.losses,
      avgKillsAdr: dailyAvgKillsAdr,
      kdRatioValue: stats.daily.kdRatio,
    },
    monthly: {
      winRatePercent: stats.last30.winRate,
      last30MatchResults: stats.last30.matchResults ?? [],
      avgKillsAdr: monthlyAvgKillsAdr,
      kdKr: monthlyKdKr,
    },
  }
}

type StatsWidgetPagePreviewProps = {
  preview: StatsWidgetPagePreviewState;
  ratingMode: StatsRatingQuery;
  backgroundOpacityPercent: number;
  borderRadius: number;
}

export function StatsWidgetPagePreview(props: StatsWidgetPagePreviewProps) {
  const { preview, ratingMode, backgroundOpacityPercent, borderRadius } = props

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
