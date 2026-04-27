import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppConfigService } from "./app-config.service";
import { FaceitService } from "./faceit.service";
import { configuration } from "./configuration";
import { StatsService } from "./stats.service";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env", "../.env"],
      load: [configuration]
    })
  ],
  controllers: [AppController],
  providers: [AppConfigService, FaceitService, StatsService]
})
export class AppModule { }
