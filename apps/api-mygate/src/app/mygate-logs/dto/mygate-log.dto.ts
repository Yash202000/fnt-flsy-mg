import { ApiProperty } from '@nestjs/swagger';

export class MyGateLogDto {
  @ApiProperty() id: number;
  @ApiProperty() timestamp: number;
  @ApiProperty() status: string;
  @ApiProperty() direction: string;
  // TODO: add card and device info
  @ApiProperty() myGateCardId: number;
}
