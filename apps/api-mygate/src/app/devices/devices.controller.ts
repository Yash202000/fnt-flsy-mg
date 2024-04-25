import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { DevicesService } from './devices.service';
import {
  AddDeviceDto,
  DeviceDto,
  EditDeviceDto,
  returnDevicePostDto,
} from './dto/device.dto';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '../core/auth/auth.guard';
import { UserAuthGuard } from '../core/auth/user-auth.guard';

@ApiTags('devices')
@UseGuards(UserAuthGuard)
@Controller('devices')
export class DevicesController {
  constructor(private deviceService: DevicesService) {}

  @ApiOperation({ summary: 'Get all the devices' })
  @ApiResponse({ status: 200, description: 'Success', type: [DeviceDto] })
  @Get()
  getDevices(): Promise<DeviceDto[]> {
    return this.deviceService.getDevices();
  }

  @ApiOperation({ summary: 'Get device information by id' })
  @ApiParam({ name: 'id', type: 'string', description: 'Example ID: 1' })
  @ApiResponse({ status: 200, description: 'Success', type: DeviceDto })
  @UseGuards(AuthGuard)
  @Get(':id')
  getDevice(@Param('id') id: number): Promise<DeviceDto> {
    return this.deviceService.getDevice(+id);
  }

  @ApiOperation({ summary: 'Create device api' })
  @ApiBody({ type: AddDeviceDto })
  @ApiResponse({
    status: 201,
    description: 'Success',
    type: returnDevicePostDto,
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  addDevice(@Body() device: AddDeviceDto) {
    return this.deviceService.addDevice(device);
  }

  @ApiOperation({ summary: 'Edit device Information' })
  @ApiParam({ name: 'id', type: 'string', description: 'Example ID: 1' })
  @ApiBody({ type: EditDeviceDto })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Success',
    type: DeviceDto,
  })
  @Put(':id')
  editDevice(
    @Param('id') id: number,
    @Body() device: EditDeviceDto
  ): Promise<DeviceDto> {
    return this.deviceService.editDevice(+id, device);
  }

  @ApiOperation({ summary: 'Delete device information api' })
  @ApiParam({ name: 'id', type: 'string', description: 'Example ID: 1' })
  @ApiResponse({ status: 204, description: 'No Content' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteDevice(@Param('id') id: number) {
    return this.deviceService.deleteDevice(); //+id
  }
}
