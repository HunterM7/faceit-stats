import { Controller, Get, Query } from '@nestjs/common';
import { LastMatchQueryDto } from './last-match-query.dto';
import { LastMatchService } from './last-match.service';

@Controller('api')
export class LastMatchController {
  constructor(private readonly lastMatchService: LastMatchService) {}

  @Get('lastMatch')
  async getLastMatch(@Query() query: LastMatchQueryDto) {
    return this.lastMatchService.getLastMatchResponse(query.playerId);
  }
}
