import { Controller, Get, Param, Post, Render, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MyGateService } from './mygate.service';
import { UserAuthGuard } from '../core/auth/user-auth.guard';
import { API_URL } from '../core/consts/env.consts';

@ApiTags('mygate')
@Controller('mygate')
export class MyGateController {
  constructor(private myGateService: MyGateService) {}

  // test api for tag sync check

  @ApiOperation({
    summary: 'mygate fontend application page route',
  })
  @ApiResponse({
    status: 200,
    description: 'Success',
  })
  @Render('index')
  @Get()
  async myGateFrontend() {
   
    return { API_URL: API_URL};
  }


  @UseGuards(UserAuthGuard)
  @ApiOperation({
    summary: 'Sync updates from MyGate and update the device state',
  })
  @ApiResponse({
    status: 200,
    description: 'Success',
  })
  @Post('sync')
  myGateSync() {
    return this.myGateService.myGateSync();
  }


  @UseGuards(UserAuthGuard)
  @ApiOperation({
    summary: 'Sync updates from MyGate and update the device state',
  })
  @ApiResponse({
    status: 200,
    description: 'Success',
  })
  @Post('sync/:deviceId')
  myGateSyncForDeviceWithDeviceId(@Param('deviceId') deviceId: string) {
    return this.myGateService.myGateSyncForDeviceWithDeviceId(deviceId);
  }

  
  @UseGuards(UserAuthGuard)
  @ApiOperation({
    summary: 'Mygate Card state',
  })
  @ApiResponse({
    status: 200,
    description: 'Success',
  })
  @Get('card/:deviceId/:access_display')
  mygateCardState(@Param('deviceId') deviceId: string,@Param('access_display') access_display: string) {
    return this.myGateService.mygateCardState(deviceId,access_display);
  }




}
