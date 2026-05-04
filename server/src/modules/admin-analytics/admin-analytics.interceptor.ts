import { BadGatewayException, CallHandler, ExecutionContext, HttpException, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { AdminAnalyticsService } from './admin-analytics.service';

@Injectable()
export class AdminAnalyticsInterceptor implements NestInterceptor {
  constructor(private readonly analyticsService: AdminAnalyticsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<{
      method?: string;
      path?: string;
      originalUrl?: string;
      route?: { path?: string };
      query?: Record<string, unknown>;
      params?: Record<string, unknown>;
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
            request: this.extractRequestMeta(request),
          });
        },
        error: (error) => {
          const errorMeta = this.extractErrorMeta(error);
          void this.analyticsService.trackRequest({
            route,
            source: this.extractSource(query),
            statusCode: response.statusCode ?? 500,
            durationMs: Date.now() - start,
            nicknames: this.extractNicknamesFromQuery(query),
            preview,
            errorMessage: errorMeta.errorMessage,
            errorOrigin: errorMeta.errorOrigin,
            serverResponse: errorMeta.serverResponse,
            request: this.extractRequestMeta(request),
          });
        },
      }),
    );
  }

  private extractErrorMessage(error: unknown): string | undefined {
    if (error instanceof Error) {
      return this.trimErrorMessage(error.message);
    }
    if (typeof error === 'string') {
      return this.trimErrorMessage(error);
    }
    if (error && typeof error === 'object' && 'message' in error) {
      const message = (error as { message?: unknown }).message;
      if (typeof message === 'string') {
        return this.trimErrorMessage(message);
      }
    }
    return undefined;
  }

  private extractErrorMeta(error: unknown): {
    errorMessage?: string;
    errorOrigin: 'faceit' | 'internal' | 'unknown';
    serverResponse?: string;
  } {
    const errorMessage = this.extractErrorMessage(error);
    const serverResponse = this.extractServerResponse(error);
    const errorOrigin = this.resolveErrorOrigin(error, errorMessage, serverResponse);
    return {
      errorMessage,
      errorOrigin,
      serverResponse,
    };
  }

  private trimErrorMessage(message: string): string | undefined {
    const trimmed = message.trim();
    if (!trimmed) {
      return undefined;
    }
    return trimmed.slice(0, 300);
  }

  private isPreviewQuery(query: Record<string, unknown>): boolean {
    const rawValue = query.preview;
    const raw = typeof rawValue === 'string' ? rawValue.trim().toLowerCase() : '';
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

  private extractSource(query: Record<string, unknown>): 'stats_widget' | 'overlay_widget' | null {
    const sourceRaw = query.source;
    const source = typeof sourceRaw === 'string' ? sourceRaw.trim() : '';
    if (source === 'stats_widget' || source === 'overlay_widget') {
      return source;
    }
    return null;
  }

  private extractRequestMeta(request: {
    method?: string;
    path?: string;
    originalUrl?: string;
    query?: Record<string, unknown>;
    params?: Record<string, unknown>;
  }): {
    method: string;
    path: string;
    query: Record<string, string | string[]>;
    params: Record<string, string>;
  } {
    const method = typeof request.method === 'string' ? request.method.toUpperCase() : 'GET';
    let path = '';
    if (typeof request.originalUrl === 'string') {
      path = request.originalUrl;
    } else if (typeof request.path === 'string') {
      path = request.path;
    }
    const query = this.normalizeQuery(request.query ?? {});
    const params = this.normalizeParams(request.params ?? {});
    return { method, path, query, params };
  }

  private normalizeQuery(raw: Record<string, unknown>): Record<string, string | string[]> {
    const result: Record<string, string | string[]> = {};
    for (const [ key, value ] of Object.entries(raw)) {
      if (typeof value === 'string') {
        result[key] = value;
        continue;
      }
      if (Array.isArray(value)) {
        const values = value.filter((item): item is string => typeof item === 'string');
        if (values.length > 0) {
          result[key] = values;
        }
      }
    }
    return result;
  }

  private normalizeParams(raw: Record<string, unknown>): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [ key, value ] of Object.entries(raw)) {
      if (typeof value === 'string') {
        result[key] = value;
      }
    }
    return result;
  }

  private extractNicknamesFromQuery(query: Record<string, unknown>): string[] {
    const result: string[] = [];
    const nickname = this.getNonEmptyString(query.nickname);
    const teammateNickname = this.getNonEmptyString(query.teammateNickname);
    if (nickname) {
      result.push(nickname);
    }
    if (teammateNickname) {
      result.push(teammateNickname);
    }
    return Array.from(new Set(result));
  }

  private extractServerResponse(error: unknown): string | undefined {
    if (!(error instanceof HttpException)) {
      return undefined;
    }
    const rawResponse = error.getResponse();
    if (typeof rawResponse === 'string') {
      return this.trimErrorMessage(rawResponse);
    }
    try {
      return this.trimErrorMessage(JSON.stringify(rawResponse));
    } catch {
      return undefined;
    }
  }

  private resolveErrorOrigin(
    error: unknown,
    errorMessage?: string,
    serverResponse?: string,
  ): 'faceit' | 'internal' | 'unknown' {
    if (error instanceof BadGatewayException) {
      return 'faceit';
    }
    const sourceText = `${errorMessage || ''} ${serverResponse || ''}`.toLowerCase();
    if (sourceText.includes('faceit')) {
      return 'faceit';
    }
    if (error instanceof HttpException) {
      return 'internal';
    }
    return 'unknown';
  }
}
