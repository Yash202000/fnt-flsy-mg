import { ApiProperty } from '@nestjs/swagger';

export class AccessSyncDto {
  @ApiProperty() st: string;
  @ApiProperty() na: number;
  @ApiProperty() a: string[];
  @ApiProperty() nr: number;
  @ApiProperty() r: string[];
  @ApiProperty() t: string;
  @ApiProperty() l: string;
}
