import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '@fnt-flsy/prisma-client-mygate';
import { AddDeviceDto, DeviceDto, EditDeviceDto } from './dto/device.dto';
import { MainFluxService } from '../mainflux/mainflux.service';
import { AuthService } from '../core/auth/auth.service';

@Injectable()
export class DevicesService {
  constructor(
    private readonly prismaService: PrismaService,
    private mainFluxService: MainFluxService,
    private authService: AuthService
  ) {}

  getDevices(): Promise<DeviceDto[]> {
    return this.prismaService.device.findMany({
      select: {
        id: true,
        deviceId: true,
        name: true,
        thingId: true,
        thingKey: true,
        channelId: true,
        lastSyncTimestamp: true,
        isMyGateDevice: true,
      },
    });
  }

  async getDevice(id: number): Promise<DeviceDto> {
    const device = await this.prismaService.device.findFirst({
      where: {
        id: id,
      },
    });
    if (!device) {
      throw new HttpException('Device not found', HttpStatus.NOT_FOUND);
    }
    return device;
  }

  async addDevice(device: AddDeviceDto): Promise<DeviceDto> {
    const uniqueDevice = await this.prismaService.device.findFirst({
      where: {
        deviceId: device.deviceId,
      },
    });
    if (uniqueDevice) {
      throw new HttpException('Device already exists', HttpStatus.BAD_REQUEST);
    }
    const thingResponse = await this.mainFluxService.createThing(
      device.deviceId
    );
    if (!(thingResponse && thingResponse.status == 201)) {
      throw new HttpException(
        'Error creating thing',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
    const thingId = thingResponse.data.things[0].id;
    const thingKey = thingResponse.data.things[0].key;
    const channelResponse = await this.mainFluxService.createChannel(
      device.deviceId
    );

    if (!(channelResponse && channelResponse.status == 201)) {
      // delete thing if channel is not created
      await this.mainFluxService.deleteThing(thingId);
      throw new HttpException(
        'Error creating channel',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
    const channelId = channelResponse.data.channels[0].id;
    const connectionResponse = await this.mainFluxService.connectThingChannel(
      thingId,
      channelId
    );
    if (!(connectionResponse && connectionResponse.status === 200)) {
      // delete thing and channel if connection fails
      await this.mainFluxService.deleteChannel(channelId);
      await this.mainFluxService.deleteThing(thingId);
      throw new HttpException(
        'Error connecting thing and channel',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
    const deviceKey = await this.authService.hashPassword(device.deviceKey);
    const newDevice = await this.prismaService.device.create({
      data: {
        deviceId: device.deviceId,
        deviceKey: deviceKey,
        name: device.name,
        thingId: thingId,
        thingKey: thingKey,
        channelId: channelId,
        lastSyncTimestamp: 0,
        isMyGateDevice: device.isMyGateDevice,
      },
    });
    if (newDevice == undefined) {
      //delete thing and channel if device is not created
      await this.mainFluxService.deleteChannel(channelId);
      await this.mainFluxService.deleteThing(thingId);
      throw new HttpException(
        'Error creating device',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
    return {
      id: newDevice.id,
      deviceId: newDevice.deviceId,
      name: newDevice.name,
      thingId: newDevice.thingId,
      thingKey: newDevice.thingKey,
      channelId: newDevice.channelId,
      lastSyncTimestamp: newDevice.lastSyncTimestamp,
      isMyGateDevice: newDevice.isMyGateDevice,
    };
  }

  async editDevice(id: number, device: EditDeviceDto): Promise<DeviceDto> {
    const foundDevice = await this.prismaService.device.findFirst({
      where: {
        id: Number(id),
      },
    });
    if (!foundDevice) {
      throw new HttpException('Device not found', HttpStatus.NOT_FOUND);
    }
    const updatedDevice = await this.prismaService.device.update({
      where: {
        id: id,
      },
      data: {
        name: device.name,
      },
    });
    return {
      id: updatedDevice.id,
      deviceId: updatedDevice.deviceId,
      name: updatedDevice.name,
      thingId: updatedDevice.thingId,
      thingKey: updatedDevice.thingKey,
      channelId: updatedDevice.channelId,
      lastSyncTimestamp: updatedDevice.lastSyncTimestamp,
      isMyGateDevice: updatedDevice.isMyGateDevice,
    };
  }

  async deleteDevice() //id: number
  {
    // TODO: implement this method
    // const device = await this.prismaService.device.findFirst({
    //   where: {
    //     id: id,
    //   },
    // });
    // if (!device) {
    //   throw new HttpException('Device not found', HttpStatus.NOT_FOUND);
    // }
    // const channelResponse = await this.mainFluxService.deleteChannel(
    //   device.channelId
    // );
    // if (channelResponse.status !== 204) {
    //   throw new HttpException(
    //     'Error deleting channel',
    //     HttpStatus.INTERNAL_SERVER_ERROR
    //   );
    // }
    // const thingResponse = await this.mainFluxService.deleteThing(
    //   device.thingId
    // );
    // if (thingResponse.status !== 204) {
    //   throw new HttpException(
    //     'Error deleting thing',
    //     HttpStatus.INTERNAL_SERVER_ERROR
    //   );
    // }
    // // TODO: fix this with id fk for devices
    // // TODO: do cascade delete
    // const uniqueTagIdlist = await this.prismaService.myGateCard.findMany({
    //   where: {
    //     deviceId: device.deviceId,
    //   },
    //   select: {
    //     id: true,
    //   },
    // });
    // uniqueTagIdlist.forEach(async (tagid) => {
    //   const deletedlogs = await this.prismaService.myGateLog.deleteMany({
    //     where: {
    //       myGateCardId: tagid.id,
    //     },
    //   });
    // });
    // const deltagresponse = await this.prismaService.myGateCard.deleteMany({
    //   where: {
    //     deviceId: device.deviceId,
    //   },
    // });
    // const syncToken = await this.prismaService.syncMessage.findFirst({
    //   where: {
    //     deviceId: device.id,
    //   },
    // });
    // if (syncToken) {
    //   const delSyncMessageCards =
    //     await this.prismaService.syncMessageCard.deleteMany({
    //       where: {
    //         sMId: syncToken.id,
    //       },
    //     });
    //   if (delSyncMessageCards) {
    //     const delSynctoken = await this.prismaService.syncMessage.delete({
    //       where: {
    //         id: syncToken.id,
    //       },
    //     });
    //   }
    // }
    // const deletedDeviceState = await this.prismaService.deviceCard.deleteMany({
    //   where: {
    //     deviceId: device.id,
    //   },
    // });
    // if (deltagresponse) {
    //   const deletedDevice = await this.prismaService.device.delete({
    //     where: {
    //       deviceId: device.deviceId,
    //     },
    //     select: {
    //       deviceId: true,
    //       name: true,
    //       thingId: true,
    //       thingKey: true,
    //       channelId: true,
    //       lastSyncTimestamp: true,
    //     },
    //   });
    //
    //   return;
    // } else
    //   throw new HttpException(
    //     {
    //       status: HttpStatus.BAD_REQUEST,
    //       error: 'Tag Not Exist',
    //     },
    //     HttpStatus.BAD_REQUEST
    //   );
  }
}
