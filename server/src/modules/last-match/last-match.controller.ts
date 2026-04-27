import { Controller, Get, Query } from '@nestjs/common';
import { LastMatchService } from './last-match.service';

@Controller('api')
export class LastMatchController {
  constructor(private readonly lastMatchService: LastMatchService) {}

  @Get('lastMatch')
  async getLastMatch(@Query('playerId') playerId?: string) {
    return this.lastMatchService.getLastMatchResponse(playerId);
  }
}
