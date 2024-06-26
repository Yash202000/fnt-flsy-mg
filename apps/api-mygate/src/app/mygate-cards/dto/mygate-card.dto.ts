import { ApiProperty, OmitType } from '@nestjs/swagger';

export class MyGateCardDto {
  @ApiProperty() id: number;
  @ApiProperty() accessEntityType: string;
  @ApiProperty() accessUuidType: string;
  @ApiProperty() accessRefId: string;
  @ApiProperty() accessUuid: string;
  @ApiProperty() accessDisplay: string;
  @ApiProperty() deviceId: string;
  @ApiProperty() isPresent?: boolean
}


export class GetMyGateCardDto {
  @ApiProperty() id: number;
  @ApiProperty() accessEntityType: string;
  @ApiProperty() accessUuidType: string;
  @ApiProperty() accessRefId: string;
  @ApiProperty() accessUuid: string;
  @ApiProperty() accessDisplay: string;
  @ApiProperty() deviceId: number;
  @ApiProperty() isPresent?: boolean
}

export class AddMyGateCardDto extends OmitType(MyGateCardDto, ['id']) {}

export class EditMyGateCardDto extends OmitType(MyGateCardDto, ['id']) {}
