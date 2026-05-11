import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CS2_FACEIT_GAME_ID } from './configuration';

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

  get gameId() {
    return this.config.get<typeof CS2_FACEIT_GAME_ID>('faceit.gameId', CS2_FACEIT_GAME_ID);
  }

  get faceitApiKey(): string {
    return this.config.get<string>('faceit.apiKey', '');
  }

  get webDistPath(): string {
    return this.config.get<string>('app.webDistPath', '');
  }

  get adminLogin(): string {
    return this.config.get<string>('admin.login', '').trim();
  }

  get adminPassword(): string {
    return this.config.get<string>('admin.password', '').trim();
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
