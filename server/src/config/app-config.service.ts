import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private readonly config: ConfigService) {}

  get port(): number {
    return this.config.get<number>('app.port', 3333);
  }

  get corsOrigin(): string {
    const raw = this.config.get<string>('app.corsOrigin', '').trim();
    // Origin из браузера без завершающего `/`; строка должна совпасть побайтово.
    return raw.replace(/\/+$/, '');
  }

  get gameId(): string {
    return this.config.get<string>('faceit.gameId', 'cs2');
  }

  get faceitApiKey(): string {
    return this.config.get<string>('faceit.apiKey', '');
  }

  get webDistPath(): string {
    return this.config.get<string>('app.webDistPath', '');
  }

  validateRequired(): void {
    if (!this.faceitApiKey) {
      throw new Error('В .env отсутствует FACEIT_API_KEY');
    }
    if (!this.corsOrigin) {
      throw new Error('В .env отсутствует CLIENT_URL');
    }
  }
}
