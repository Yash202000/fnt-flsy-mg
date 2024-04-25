import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@fnt-flsy/prisma-client-mygate';
import axios from 'axios';
import { Cron } from '@nestjs/schedule';
import {
  MyGateNotifyDto,
  MyGateNotifyResponseDto,
  MyGateSyncResponseDto,
} from './dto/mygate.dto';
import {
  API_URL,
  DEVICE_SYNC_BATCH_SIZE,
  DEVICE_SYNC_CRON,
  MYGATE_API_KEY,
  MYGATE_API_URL,
  MYGATE_SYNC_CRON,
} from '../core/consts/env.consts';
import { MainFluxService } from '../mainflux/mainflux.service';
import { Device } from '@prisma/client/mygate';
import { AccessSyncDto } from '../core/dto/access-sync.dto';

@Injectable()
export class MyGateService {
  constructor(
    private readonly prismaService: PrismaService,
    private mainFluxService: MainFluxService
  ) { }


  async mygateCardState(deviceId: string, access_display: string) {
    const device = await this.prismaService.device.findFirst({
      where: {
        deviceId: deviceId
      }
    });
    if (!device) throw new HttpException('device not found', HttpStatus.NOT_FOUND);

    const mygate_card = await this.prismaService.myGateCard.findFirst({
      where: {
        accessDisplay: access_display,
        deviceId: device.id
      },
      select: {
        accessDisplay: true
      }
    })

    const device_card = await this.prismaService.deviceCard.findFirst({
      where: {
        cardId: access_display,
        deviceId: device.id
      },
      select: {
        cardId: true
      }
    })

    return {
      server: mygate_card,
      device: device_card
    }

  }

  async myGateNotify(myGateNotifyDto: MyGateNotifyDto) {
    return axios.post(
      `${MYGATE_API_URL}/access/v1/notify`,
      myGateNotifyDto,
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'mg-xs-api-key': `${MYGATE_API_KEY}`,
        },
      }
    );
  }

  @Cron(MYGATE_SYNC_CRON, {
    name: 'myGateSync',
  })
  async myGateSync() {
    try {
      const devices = await this.prismaService.device.findMany({
        where: { isMyGateDevice: true },
        select: { id: true },
      });
      const deviceIds = devices.map((d) => d.id);
      // TODO: implement workers
      const promises = [];
      for (const id of deviceIds) {
        promises.push(this.myGateSyncForDeviceWithId(id));
      }
      await Promise.all(promises);
    } catch (e) {
      Logger.log('myGateSync', e);
    }
  }

  async myGateSyncForDeviceWithDeviceId(deviceId: string) {
    const device = await this.prismaService.device.findFirst({
      where: { deviceId: deviceId },
    });
    if (!device) {
      throw new HttpException('Device not found', HttpStatus.NOT_FOUND);
    }
    return this.myGateSyncForDevice(device);
  }

  async myGateSyncForDeviceWithId(id: number) {
    const device = await this.prismaService.device.findFirst({
      where: { id: id },
    });
    if (!device) {
      throw new HttpException('Device not found', HttpStatus.NOT_FOUND);
    }
    return this.myGateSyncForDevice(device);
  }

  async myGateSyncForDevice(device: Device) {
    const { id, deviceId, lastSyncTimestamp } = device;
    let page = 0;
    let isAll = false;
    const accessRefIdsInAll = [];
    const flag = true;
    while (flag) {
      const myGateSyncResponse = await this.fetchSyncDataFromMyGate(
        deviceId,
        lastSyncTimestamp,
        page
      );
      if (myGateSyncResponse.all) {
        isAll = true;
        for (const myGateSyncCard of myGateSyncResponse.all) {
          accessRefIdsInAll.push(myGateSyncCard.access_ref_id);
          await this.prismaService.myGateCard.upsert({
            create: {
              accessRefId: myGateSyncCard.access_ref_id,
              accessUuid: myGateSyncCard.access_uuid,
              accessUuidType: myGateSyncCard.access_uuid_type,
              accessEntityType: myGateSyncCard.access_entity_type,
              accessDisplay: myGateSyncCard.access_display,
              deviceId: id,
            },
            update: {
              accessUuid: myGateSyncCard.access_uuid,
              accessUuidType: myGateSyncCard.access_uuid_type,
              accessEntityType: myGateSyncCard.access_entity_type,
              accessDisplay: myGateSyncCard.access_display,
            },
            where: {
              deviceId_accessRefId: {
                deviceId: id,
                accessRefId: myGateSyncCard.access_ref_id,
              },
            },
          });
        }
      }
      if (myGateSyncResponse.upserted) {
        for (const myGateSyncCard of myGateSyncResponse.upserted) {
          await this.prismaService.myGateCard.upsert({
            create: {
              accessRefId: myGateSyncCard.access_ref_id,
              accessUuid: myGateSyncCard.access_uuid,
              accessUuidType: myGateSyncCard.access_uuid_type,
              accessEntityType: myGateSyncCard.access_entity_type,
              accessDisplay: myGateSyncCard.access_display,
              deviceId: id,
            },
            update: {
              accessUuid: myGateSyncCard.access_uuid,
              accessUuidType: myGateSyncCard.access_uuid_type,
              accessEntityType: myGateSyncCard.access_entity_type,
              accessDisplay: myGateSyncCard.access_display,
            },
            where: {
              deviceId_accessRefId: {
                deviceId: id,
                accessRefId: myGateSyncCard.access_ref_id,
              },
            },
          });
        }
      }
      if (myGateSyncResponse.deleted) {
        await this.prismaService.myGateCard.deleteMany({
          where: { accessRefId: { in: myGateSyncResponse.deleted } },
        });
      }
      if (!myGateSyncResponse._links) {
        break;
      }
      page++;
    }
    if (isAll) {
      await this.prismaService.myGateCard.deleteMany({
        where: {
          deviceId: id,
          accessRefId: {
            notIn: accessRefIdsInAll,
          },
        },
      });
    }
    console.log('Fetched MyGate cards for device', deviceId);
  }

  async fetchSyncDataFromMyGate(
    deviceId: string,
    lastSyncTimestamp: number,
    page = 0
  ) {
    const url = `${MYGATE_API_URL}/access/v1/sync?device_id=${deviceId}&timestamp=${lastSyncTimestamp}&page=${page}`;
    const r = await axios.get<MyGateSyncResponseDto>(url, {
      headers: {
        'Content-Type': 'application/json',
        'mg-xs-etype': 'VEHICLE',
        'mg-xs-api-key': `${MYGATE_API_KEY}`,
      },
    });
    return r.data;
  }

  @Cron(DEVICE_SYNC_CRON, {
    name: 'deviceSyncMyGate',
  })
  async deviceSyncMyGate() {
    try {
      const devices = await this.prismaService.device.findMany({
        where: { isMyGateDevice: true },
        select: { id: true },
      });
      const deviceIds = devices.map((d) => d.id);
      // TODO: implement workers
      const promises: Promise<void>[] = [];
      for (const deviceId of deviceIds) {
        const promise = this.deviceSyncMyGateForDevice(deviceId);
        promises.push(promise);
      }
      await Promise.all(promises);
    } catch (e) {
      Logger.log('deviceSync', e);
    }
  }

  async deviceSyncMyGateForDevice(id: number) {
    await this.prismaService
      .$transaction(async (tx) => {
        const device = await tx.device.findFirst({
          where: { id: id },
          include: {
            deviceCards: true,
            myGateCards: true,
          },
        });
        const { deviceCards, myGateCards } = device;
        const deviceCardsCardIds = deviceCards.map((c) => c.cardId);
        const myGateCardsAccessDisplays = myGateCards.map(
          (c) => c.accessDisplay
        );
        const toAdd = myGateCardsAccessDisplays.filter(
          (c) => !deviceCardsCardIds.includes(c)
        );
        const toDelete = deviceCardsCardIds.filter(
          (c) => !myGateCardsAccessDisplays.includes(c)
        );
        if (toAdd.length === 0 && toDelete.length === 0) {
          return;
        }
        const toAddBatch =
          toAdd.length > DEVICE_SYNC_BATCH_SIZE
            ? toAdd.slice(0, DEVICE_SYNC_BATCH_SIZE)
            : toAdd;
        const toDeleteBatch =
          toDelete.length > DEVICE_SYNC_BATCH_SIZE
            ? toDelete.slice(0, DEVICE_SYNC_BATCH_SIZE)
            : toDelete;
        const syncToken = await this.sendDeviceSyncMessage(
          device,
          toAddBatch,
          toDeleteBatch
        );
        const syncMessageCards: { cardId: string; status: 'ADD' | 'REMOVE' }[] =
          toAddBatch
            .map((c) => {
              return { cardId: c, status: 'ADD' } as {
                cardId: string;
                status: 'ADD' | 'REMOVE';
              };
            })
            .concat(
              toDeleteBatch.map((c) => {
                return { cardId: c, status: 'REMOVE' } as {
                  cardId: string;
                  status: 'ADD' | 'REMOVE';
                };
              })
            );
        await tx.syncMessage.create({
          data: {
            deviceId: id,
            syncToken: syncToken,
            cards: {
              create: syncMessageCards,
            },
          },
        });
        console.log(
          'Add sync message for device',
          device.deviceId,
          syncToken,
          syncMessageCards
        );
      })
      .catch((e) => {
        Logger.log('deviceSyncMyGateForDevice', e);
      });
  }

  async sendDeviceSyncMessage(
    device: Device,
    toAdd: string[],
    toDelete: string[]
  ) {
    const syncToken = new Date().getTime();
    const accessSyncDto: AccessSyncDto = {
      st: String(syncToken),
      na: toAdd.length,
      a: toAdd,
      nr: toDelete.length,
      r: toDelete,
      t: 'HTTP',
      l: `${API_URL}/sync-ack/${device.deviceId}`,
    };
    await this.mainFluxService.connectAndPublishWithRetry(
      accessSyncDto,
      device.thingId,
      device.thingKey,
      device.channelId,
      'mygate-sync'
    );
    console.log('Sent sync message to device', device.deviceId, accessSyncDto);
    return String(syncToken);
  }
}
