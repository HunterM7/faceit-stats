import { Controller, Get, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { TwitchCommandsService } from './twitch-commands.service';

@Controller('api')
export class TwitchCommandsController {
  constructor(private readonly twitchCommandsService: TwitchCommandsService) {}

  /**
   * Сырое `elo` / `level` для вставки чатботом в текст !elo.
   */
  @Get('twitch/field')
  async getField(
    @Query('nickname') nickname: string | undefined,
    @Query('name') name: string | undefined,
    @Res() res: Response,
  ): Promise<void> {
    const body = await this.twitchCommandsService.getFieldText(nickname, name);
    res.type('text/plain; charset=utf-8').send(body);
  }

  /**
   * Готовый текст !elo по шаблону — для Moobot.
   */
  @Get('twitch/elo')
  async getElo(
    @Query('nickname') nickname: string | undefined,
    @Query('text') text: string | undefined,
    @Res() res: Response,
  ): Promise<void> {
    const body = await this.twitchCommandsService.getEloMessageText(nickname, text);
    res.type('text/plain; charset=utf-8').send(body);
  }

  /**
   * Готовая строка !stats (фиксированный формат).
   */
  @Get('twitch/stats')
  async getStats(@Query('nickname') nickname: string | undefined, @Res() res: Response): Promise<void> {
    const body = await this.twitchCommandsService.getStatsText(nickname);
    res.type('text/plain; charset=utf-8').send(body);
  }
}
