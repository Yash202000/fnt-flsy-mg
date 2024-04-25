import { ApiProperty, PickType } from '@nestjs/swagger';

export class DeviceDto {
  @ApiProperty() id: number;
  @ApiProperty() deviceId: string;
  @ApiProperty() name: string;
  @ApiProperty() thingId: string;
  @ApiProperty() thingKey: string;
  @ApiProperty() channelId: string;
  @ApiProperty() lastSyncTimestamp: number;
  @ApiProperty() isMyGateDevice: boolean;
}

export class AddDeviceDto extends PickType(DeviceDto, [
  'deviceId',
  'name',
  'isMyGateDevice',
]) {
  @ApiProperty() deviceKey: string;
}

export class EditDeviceDto extends PickType(DeviceDto, ['id', 'name']) {}

export class returnDevicePostDto {
  @ApiProperty() thingId: string;
  @ApiProperty() thingKey: string;
  @ApiProperty() channelId: string;
}
