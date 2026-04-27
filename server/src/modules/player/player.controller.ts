import { Controller, Get, Query } from '@nestjs/common';
import { PlayerService } from './player.service';

@Controller('api')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @Get('player')
  async getPlayerSnapshot(@Query('nickname') nickname?: string) {
    return this.playerService.getPlayerSnapshotResponse(nickname);
  }
}
