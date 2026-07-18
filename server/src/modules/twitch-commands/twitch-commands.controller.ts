import { Controller, Get, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { TwitchCommandsService } from './twitch-commands.service';

@Controller('api')
export class TwitchCommandsController {
  constructor(private readonly twitchCommandsService: TwitchCommandsService) {}

  /**
   * Plain-text ответ для чатбота: «Текущее эло: N».
   * Подходит для Nightbot `$(urlfetch …)` / StreamElements `${customapi.…}`.
   */
  @Get('twitch/elo')
  async getElo(@Query('nickname') nickname: string | undefined, @Res() res: Response): Promise<void> {
    const text = await this.twitchCommandsService.getEloText(nickname);
    res.type('text/plain; charset=utf-8').send(text);
  }

  /**
   * Plain-text ответ для чатбота с краткой статистикой игрока.
   * Подходит для Nightbot `$(urlfetch …)` / StreamElements `${customapi.…}`.
   */
  @Get('twitch/stats')
  async getStats(@Query('nickname') nickname: string | undefined, @Res() res: Response): Promise<void> {
    const text = await this.twitchCommandsService.getStatsText(nickname);
    res.type('text/plain; charset=utf-8').send(text);
  }
}
