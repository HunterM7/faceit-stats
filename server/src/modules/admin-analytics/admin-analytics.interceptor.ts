import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { AdminAnalyticsService } from './admin-analytics.service';

@Injectable()
export class AdminAnalyticsInterceptor implements NestInterceptor {
  constructor(private readonly analyticsService: AdminAnalyticsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<{
      path?: string;
      route?: { path?: string };
      query?: Record<string, string | undefined>;
    }>();
    const response = http.getResponse<{ statusCode?: number }>();

    const route = request.path ?? request.route?.path ?? '';
    const shouldTrack = route.startsWith('/api/') && !route.startsWith('/api/admin');
    if (!shouldTrack) {
      return next.handle();
    }

    const query = request.query ?? {};
    const preview = this.isPreviewQuery(query);
    const start = Date.now();
    return next.handle().pipe(
      tap({
        next: (responsePayload) => {
          const statusCode = response.statusCode ?? 200;
          const nicknames =
            statusCode >= 200 && statusCode < 400
              ? this.extractNicknamesFromResponse(responsePayload)
              : [];
          void this.analyticsService.trackRequest({
            route,
            source: this.extractSource(query),
            statusCode,
            durationMs: Date.now() - start,
            nicknames,
            preview,
          });
        },
        error: () => {
          void this.analyticsService.trackRequest({
            route,
            source: this.extractSource(query),
            statusCode: response.statusCode ?? 500,
            durationMs: Date.now() - start,
            nicknames: [],
            preview,
          });
        },
      }),
    );
  }

  private isPreviewQuery(query: Record<string, string | undefined>): boolean {
    const raw = query.preview?.trim().toLowerCase();
    return raw === '1' || raw === 'true' || raw === 'yes';
  }

  private extractNicknamesFromResponse(responsePayload: unknown): string[] {
    if (!responsePayload || typeof responsePayload !== 'object') {
      return [];
    }

    const payload = responsePayload as {
      nickname?: unknown;
      teammateNickname?: unknown;
      raw?: {
        player?: {
          nickname?: unknown;
        };
      };
    };

    const result: string[] = [];
    const nickname = this.getNonEmptyString(payload.nickname);
    const teammateNickname = this.getNonEmptyString(payload.teammateNickname);
    const rawPlayerNickname = this.getNonEmptyString(payload.raw?.player?.nickname);
    if (nickname) {
      result.push(nickname);
    }
    if (teammateNickname) {
      result.push(teammateNickname);
    }
    if (rawPlayerNickname) {
      result.push(rawPlayerNickname);
    }
    return result;
  }

  private getNonEmptyString(value: unknown): string | null {
    if (typeof value !== 'string') {
      return null;
    }
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }
    return trimmed;
  }

  private extractSource(query: Record<string, string | undefined>): 'stats_widget' | 'overlay_widget' | null {
    const source = query.source?.trim();
    if (source === 'stats_widget' || source === 'overlay_widget') {
      return source;
    }
    return null;
  }
}
