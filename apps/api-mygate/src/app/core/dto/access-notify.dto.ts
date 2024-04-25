import { ApiProperty } from '@nestjs/swagger';

export class AccessNotifyDto {
  @ApiProperty() ci: string; //cardId
  @ApiProperty() ts: string; //timestamp
  @ApiProperty() st: string; //status
  @ApiProperty() dr: string; //direction
}
