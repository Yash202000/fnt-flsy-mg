import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CommunicationService } from './communication.service';
import { AccessNotifyDto } from '../core/dto/access-notify.dto';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '../core/auth/auth.guard';
import {
  DateTimeForDeviceDto,
  DeviceCredentialsResponseForDeviceDto,
} from './dto/communication.dto';
import {AccessSyncDto} from "../core/dto/access-sync.dto";
import {AccessSyncAckDto} from "../core/dto/access-sync-ack.dto";

@Controller()
export class CommunicationController {
  constructor(private communicationService: CommunicationService) {}

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Notify the server with device log' })
  @ApiParam({
    name: 'deviceId',
    type: 'string',
    description: 'Example ID: fountlab_tag_01',
  })
  @ApiBody({ type: AccessNotifyDto })
  @ApiResponse({ status: 201, description: 'Success' })
  @Post('notify/:deviceId')
  accessNotify(
    @Param('deviceId') deviceId: string,
    @Body() accessNotifyDto: AccessNotifyDto
  ): Promise<{ success: boolean }> {
    return this.communicationService.accessNotify(deviceId, accessNotifyDto);
  }

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get credentials for the device' })
  @ApiParam({
    name: 'deviceId',
    type: 'string',
    description: 'Example ID: fountlab_tag_01',
  })
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: DeviceCredentialsResponseForDeviceDto,
  })
  @Get('credentials/:deviceId')
  getCredentials(
    @Param('deviceId') deviceId: string
  ): Promise<DeviceCredentialsResponseForDeviceDto> {
    return this.communicationService.getCredentials(deviceId);
  }

  @ApiOperation({ summary: 'Get current time on the server' })
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: DateTimeForDeviceDto,
  })
  @Get('time')
  getTime(): Promise<DateTimeForDeviceDto> {
    return this.communicationService.getTime();
  }

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Api for device liveness' })
  @ApiResponse({ status: 200, description: 'Success', type: Number })
  @Get('i-am-here/:deviceId') // seconds in epoc
  iAmHere(@Param('deviceId') deviceId: string) {
    return this.communicationService.iAmHere(deviceId);
  }

  @ApiOperation({ summary: 'Publish the message on channel with mqtt' })
  @ApiParam({
    name: 'deviceId',
    type: 'string',
    description: 'Example ID: Aa23hk23',
  })
  @ApiBody({ type: AccessSyncDto })
  @ApiResponse({ status: 201, description: 'Success' })
  @Post('access-sync/:deviceId')
  accessSync(
    @Param('deviceId') deviceId: string,
    @Body() accessSyncDto: AccessSyncDto,
  ) {
    return this.communicationService.accessSync(deviceId, accessSyncDto);
  }

  @UseGuards(AuthGuard)
  @Post('sync-ack/:deviceId')
  accessSyncAck(@Param('deviceId') deviceId: string, @Body() accessSyncAckDto: AccessSyncAckDto){
    return this.communicationService.accessSyncAck(deviceId, accessSyncAckDto);
  }
}
