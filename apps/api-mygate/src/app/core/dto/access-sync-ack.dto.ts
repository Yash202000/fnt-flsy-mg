import { ApiProperty } from '@nestjs/swagger';

export class AccessSyncAckDto {
  @ApiProperty() st: string;
  @ApiProperty() status: boolean;
}
