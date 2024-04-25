import { PrismaService } from '@fnt-flsy/prisma-client-mygate';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  AddMyGateCardDto,
  EditMyGateCardDto,
  GetMyGateCardDto,
  MyGateCardDto,
} from './dto/mygate-card.dto';

@Injectable()
export class MyGateCardsService {
  constructor(private readonly prismaService: PrismaService) { }

  async getMyGateCards(deviceId: string): Promise<GetMyGateCardDto[]> {
    // check for device and get device cards and mygate cards from the device

    const device = await this.prismaService.device.findFirst({
      where: {
        deviceId: deviceId
      },
      include: {
        myGateCards: true,
        deviceCards: true
      }
    })

    if (!device) throw new HttpException("device not found", HttpStatus.NOT_FOUND);

    // first take mygatecards and devicecards out from the object.

    const mygateCards = device.myGateCards;
    const deviceCards = device.deviceCards;
    
    // Iterate over each item in mygateCards
    const mygateCardsWithPresence = mygateCards.map(mygateCard => {
      // Check if the accessDisplay of the current mygateCard exists in deviceCards
      const isPresent = deviceCards.some(deviceCard => deviceCard.cardId === mygateCard.accessDisplay);

      // Return the mygateCard with the isPresent field added
      return {
        ...mygateCard,
        isPresent
      };
    });

    return mygateCardsWithPresence
  }

  async getMyGateCard(id: number) {
    const myGateCard = await this.prismaService.myGateCard.findFirst({
      where: {
        id: id,
      },
      include: {
        device: true,
      },
    });
    if (!myGateCard) {
      throw new HttpException('MyGate card not found', HttpStatus.NOT_FOUND);
    }
    return { ...myGateCard, deviceId: myGateCard.device.deviceId };
  }

  async addMyGateCard(addMyGateCardDto: AddMyGateCardDto) {
    console.log(addMyGateCardDto);
    const existingTag = await this.prismaService.myGateCard.findFirst({
      where: {
        OR: [
          {
            accessRefId: addMyGateCardDto.accessRefId,
          },
          { accessDisplay: addMyGateCardDto.accessDisplay },
        ],
      },
    });
    if (existingTag) {
      throw new HttpException(
        'MyGate card already exists',
        HttpStatus.BAD_REQUEST
      );
    }
    const device = await this.prismaService.device.findFirst({
      where: {
        deviceId: addMyGateCardDto.deviceId,
      },
    });
    if (!device) {
      throw new HttpException('Device not found', HttpStatus.NOT_FOUND);
    }
    return this.prismaService.myGateCard.create({
      data: {
        accessDisplay: String(addMyGateCardDto.accessDisplay),
        accessEntityType: String(addMyGateCardDto.accessEntityType),
        accessRefId: String(addMyGateCardDto.accessRefId),
        accessUuid: String(addMyGateCardDto.accessUuidType),
        accessUuidType: String(addMyGateCardDto.accessUuidType),
        deviceId: device.id,
      },
    });
  }

  async editMyGateCard(id: number, editMyGateCardDto: EditMyGateCardDto) {
    const device = await this.prismaService.device.findFirst({
      where: {
        deviceId: editMyGateCardDto.deviceId,
      },
    });
    if (!device) {
      throw new HttpException('Device not found', HttpStatus.NOT_FOUND);
    }
    const edited = await this.prismaService.myGateCard.update({
      where: {
        id: id,
      },
      data: { ...editMyGateCardDto, deviceId: device.id },
    });
    return { ...edited, deviceId: device.deviceId };
  }

  async deleteMyGateCard(id: number): Promise<MyGateCardDto> {
    const myGateCard = await this.prismaService.myGateCard.findFirst({
      where: {
        id: id,
      },
      include: {
        device: true,
      },
    });
    if (!myGateCard) {
      throw new HttpException('MyGate card not found', HttpStatus.NOT_FOUND);
    }
    const deleted = await this.prismaService.myGateCard.delete({
      where: {
        id: id,
      },
    });
    return { ...deleted, deviceId: myGateCard.device.deviceId };
  }
}
