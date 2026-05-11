import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class LastMatchQueryDto {
  @IsNotEmpty({ message: 'Необходимо передать параметр playerId.' })
  @IsString({ message: 'Параметр playerId должен быть строкой.' })
  @IsUUID('4', { message: 'Параметр playerId должен быть в формате UUID v4.' })
  playerId!: string;
}
