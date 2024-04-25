import { ApiProperty } from '@nestjs/swagger';

export class DeviceCredentialsResponseDto {
  @ApiProperty() imei: string;
  @ApiProperty() clientid: string;
  @ApiProperty() username: string;
  @ApiProperty() password: string;
  @ApiProperty() broker: string;
  @ApiProperty() port: string;
  @ApiProperty() notify: string;
}

export class DeviceCredentialsResponseForDeviceDto {
  @ApiProperty() 'status': boolean;
  @ApiProperty() resp: DeviceCredentialsResponseDto;
}

export class DateTimeDto {
  @ApiProperty() day: number;
  @ApiProperty() month: number; // Month is 0-based, so we add 1 to get the correct month
  @ApiProperty() year: number; // Subtract 2000 to get the two-digit year representation
  @ApiProperty() hour: number;
  @ApiProperty() min: number;
  @ApiProperty() sec: number;
}

export class DateTimeForDeviceDto {
  @ApiProperty() status: boolean;
  @ApiProperty() datetime: DateTimeDto;
}
