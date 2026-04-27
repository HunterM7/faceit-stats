import { Controller, Get, Query } from '@nestjs/common';
import { DuoMatchesService } from './duo-matches.service';

@Controller('api')
export class DuoMatchesController {
  constructor(private readonly duoMatchesService: DuoMatchesService) {}

  @Get('duoMatches')
  async getDuoMatches(
    @Query('nickname') nickname?: string,
    @Query('teammateNickname') teammateNickname?: string,
  ) {
    return this.duoMatchesService.getDuoMatchesResponse(nickname, teammateNickname);
  }
}
