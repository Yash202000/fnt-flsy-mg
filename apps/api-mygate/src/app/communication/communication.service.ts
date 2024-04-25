import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma, PrismaService } from '@fnt-flsy/prisma-client-mygate';
import { MainFluxService } from '../mainflux/mainflux.service';
import { MyGateService } from '../mygate/mygate.service';
import { AccessNotifyDto } from '../core/dto/access-notify.dto';
import {
  API_URL,
  MQTT_DOMAIN_MYGATE,
  MQTT_PORT_MYGATE,
} from '../core/consts/env.consts';
import { DateTimeForDeviceDto } from './dto/communication.dto';
import { AccessSyncDto } from '../core/dto/access-sync.dto';
import { AccessSyncAckDto } from '../core/dto/access-sync-ack.dto';

@Injectable()
export class CommunicationService {
  constructor(
    private prismaService: PrismaService,
    private mainFluxService: MainFluxService,
    private myGateService: MyGateService
  ) { }

  async accessNotify(deviceId: string, accessNotifyDto: AccessNotifyDto) {
    // get device by device id
    const device = await this.prismaService.device.findFirst({
      where: {
        deviceId: deviceId,
      },
    });
    if (!device) {
      throw new HttpException('Device not found', HttpStatus.NOT_FOUND);
    }


    // TODO: maintain MQTT status

    //.....
    // const isPublishedToMqtt = await this.mainFluxService.publishNotifyToMqtt(
    //   accessNotifyDto,
    //   deviceId,
    //   device.thingId,
    //   device.thingKey,
    //   device.channelId
    // );
    //......

    // if (!isPublishedToMqtt) {
    //   // TODO: maintain publish status
    //   console.error(`Could not publish to MQTT`, accessNotifyDto);
    // }

    if (!device.isMyGateDevice) {
      return { success: true };
    }

    // get card by access display
    const myGateCard = await this.prismaService.myGateCard.findFirst({
      where: {
        accessDisplay: accessNotifyDto.ci,
        deviceId: device.id
      },
    });
    if (!myGateCard) {
      throw new HttpException('MyGate card not found', HttpStatus.NOT_FOUND);
    }

    let myGateNotifyResponse;
    let isNotified = false;
    let isNotifiedSuccessfully = false;
    let response_timestamp;

    try {
      // call MyGate notify
      myGateNotifyResponse = await this.myGateService.myGateNotify({
        device_id: device.deviceId,
        access_uuid_type: myGateCard.accessUuidType,
        access_entity_type: myGateCard.accessEntityType,
        access_ref_id: myGateCard.accessRefId,
        access_uuid_captured: accessNotifyDto.ci,
        direction: accessNotifyDto.dr,
        status: accessNotifyDto.st,
        timestamp: String(accessNotifyDto.ts),
      });

      isNotified = true;
      isNotifiedSuccessfully = myGateNotifyResponse.data.es == '0' && myGateNotifyResponse.data.message.toUpperCase() === 'Success'.toUpperCase();
      response_timestamp = new Date();



    } catch (error) {
      console.log('error while notifying to mygate , ', error)
    }



    console.log(
      'Published notification to MyGate from device',
      deviceId,
      accessNotifyDto
    );
    console.log("MyGate Response ", myGateNotifyResponse?.data)


    const log = await this.prismaService.myGateLog.create({
      data: {
        timestamp: Number(accessNotifyDto.ts),
        status: accessNotifyDto.st,
        direction: accessNotifyDto.dr,
        myGateCardId: myGateCard.id,
        isNotifiedToMyGate: isNotified,
        myGateResponse: isNotified == true ? myGateNotifyResponse?.data : null,
        myGateResponseTimestamp: isNotified == true ? response_timestamp : null,
        isNotifiedToMyGateSuccessfully: isNotifiedSuccessfully
      },
    });
    if (!log) throw new HttpException("internal server error while creating log", HttpStatus.INTERNAL_SERVER_ERROR);

    console.log(
      'Received MyGate notification from device',
      deviceId,
      accessNotifyDto
    );
    console.log('success notification with typeof ', myGateNotifyResponse?.data)
    return {
      success: true,
    };

  }

  async getCredentials(deviceId: string) {
    const deviceResponse = await this.prismaService.device.findFirst({
      where: {
        deviceId: deviceId,
      },
    });
    if (!deviceResponse) {
      throw new HttpException('Device not found', HttpStatus.NOT_FOUND);
    }
    return {
      status: true,
      resp: {
        imei: deviceId,
        clientid: deviceResponse.channelId,
        username: deviceResponse.thingId,
        password: deviceResponse.thingKey,
        broker: MQTT_DOMAIN_MYGATE,
        port: MQTT_PORT_MYGATE,
        notify: API_URL + `/notify/${deviceId}`,
      },
    };
  }

  async getTime(): Promise<DateTimeForDeviceDto> {
    // TODO: handle time zone
    const now = new Date();
    return {
      status: true,
      datetime: {
        day: now.getDate(),
        month: now.getMonth() + 1, // Month is 0-based, so we add 1 to get the correct month
        year: now.getFullYear() - 2000, // Subtract 2000 to get the two-digit year representation
        hour: now.getHours(),
        min: now.getMinutes(),
        sec: now.getSeconds(),
      },
    };
  }

  async iAmHere(deviceId: string) {
    const device = await this.prismaService.device.findFirst({
      where: {
        deviceId: String(deviceId),
      },
    });
    if (!device) {
      throw new HttpException('Device not found', HttpStatus.NOT_FOUND);
    }
    return this.prismaService.iAmHereLog.create({
      data: {
        deviceId: device.id,
      },
    });
  }

  // utility method
  async accessSync(deviceId: string, accessSyncDto: AccessSyncDto) {
    const device = await this.prismaService.device.findFirst({
      where: { deviceId: deviceId },
    });
    if (!device) {
      throw new HttpException('Device not found', HttpStatus.NOT_FOUND);
    }
    return this.mainFluxService.connectAndPublishWithRetry(
      accessSyncDto,
      device.thingId,
      device.thingKey,
      device.channelId,
      'mygate-sync'
    );
  }

  async accessSyncAck(deviceId: string, accessSyncAckDto: AccessSyncAckDto) {
    let id: number;
    let isMyGateDevice = false;
    console.log('Received sync ack from device', deviceId, accessSyncAckDto);
    await this.prismaService.$transaction(async (tx) => {
      const device = await tx.device.findFirst({
        where: { deviceId: deviceId },
      });
      if (!device) {
        throw new HttpException('Device not found', HttpStatus.NOT_FOUND);
      }
      id = device.id;
      isMyGateDevice = device.isMyGateDevice;
      const syncMessage = await tx.syncMessage.findFirst({
        where: {
          deviceId: device.id,
          syncToken: accessSyncAckDto.st,
        },
        include: {
          cards: true,
        },
      });
      if (!syncMessage) {
        throw new HttpException('Sync message not found', HttpStatus.NOT_FOUND);
      }
      const cards = syncMessage.cards;
      const addedCards = cards
        .filter((c) => c.status === 'ADD')
        .map((c) => c.cardId);
      const removedCards = cards
        .filter((c) => c.status === 'REMOVE')
        .map((c) => c.cardId);
      for (const addedCard of addedCards) {
        await tx.deviceCard.upsert({
          create: {
            deviceId: device.id,
            cardId: addedCard,
          },
          update: {},
          where: {
            deviceId_cardId: {
              deviceId: device.id,
              cardId: addedCard,
            },
          },
        });
      }
      await tx.deviceCard.deleteMany({
        where: {
          deviceId: device.id,
          cardId: {
            in: removedCards,
          },
        },
      });
      await tx.syncMessageCard.deleteMany({
        where: {
          syncMessageId: syncMessage.id,
        },
      });
      await tx.syncMessage.delete({
        where: {
          id: syncMessage.id,
        },
      });
    });
    console.log('Processed sync ack from device', deviceId, accessSyncAckDto);
    // TODO: implement worker
    if (isMyGateDevice) {
      await this.myGateService.deviceSyncMyGateForDevice(id);
    }
    return { status: 'ok' };
  }
}