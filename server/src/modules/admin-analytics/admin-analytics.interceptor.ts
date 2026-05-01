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

    const start = Date.now();
    return next.handle().pipe(
      tap({
        next: () => {
          void this.analyticsService.trackRequest({
            route,
            source: this.extractSource(request.query ?? {}),
            statusCode: response.statusCode ?? 200,
            durationMs: Date.now() - start,
            nicknames: this.extractNicknames(request.query ?? {}),
          });
        },
        error: () => {
          void this.analyticsService.trackRequest({
            route,
            source: this.extractSource(request.query ?? {}),
            statusCode: response.statusCode ?? 500,
            durationMs: Date.now() - start,
            nicknames: this.extractNicknames(request.query ?? {}),
          });
        },
      }),
    );
  }

  private extractNicknames(query: Record<string, string | undefined>): string[] {
    const result: string[] = [];
    const nickname = query.nickname?.trim();
    const teammateNickname = query.teammateNickname?.trim();
    if (nickname) {
      result.push(nickname);
    }
    if (teammateNickname) {
      result.push(teammateNickname);
    }
    return result;
  }

  private extractSource(query: Record<string, string | undefined>): 'stats_widget' | 'overlay_widget' | null {
    const source = query.source?.trim();
    if (source === 'stats_widget' || source === 'overlay_widget') {
      return source;
    }
    return null;
  }
}
