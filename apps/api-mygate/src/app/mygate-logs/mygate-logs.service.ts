import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '@fnt-flsy/prisma-client-mygate';
import { MyGateLogDto } from './dto/mygate-log.dto';

@Injectable()
export class MyGateLogsService {
  constructor(private prismaService: PrismaService) {}
  async getDataForDeviceLogInExcel(deviceId: string,fromTimestamp: number, toTimestamp: number){
    console.log(deviceId , fromTimestamp , toTimestamp)
    const device = await  this.prismaService.device.findFirst({
      where:{
        deviceId: deviceId
      }
    })
    if(!device) throw new HttpException('device not found',HttpStatus.NOT_FOUND);

    console.log(device.id,fromTimestamp,toTimestamp);

    const response : any= await this.prismaService.$queryRaw`
    SELECT b.access_display, b.access_ref_id, a.timestamp, a.status, a.direction, a.mygate_response
    FROM mygate_logs AS a
    INNER JOIN mygate_cards AS b ON a.mygate_card_id = b.id
    WHERE a.mygate_card_id IN (SELECT id FROM mygate_cards WHERE device_id = ${device.id})
    AND a.created_at >= TO_TIMESTAMP(${fromTimestamp}) AND a.created_at <= TO_TIMESTAMP(${toTimestamp});
    `

    console.log(response);
    return response;
    
  }

  async getMyGateLogs(myGateCardId?: number): Promise<MyGateLogDto[]> {
    return this.prismaService.myGateLog.findMany({
      select: {
        id: true,
        timestamp: true,
        status: true,
        direction: true,
        myGateCardId: true,
      },
      where: {
        myGateCardId: myGateCardId,
      },
    });
  }

  async getMyGateLog(id: number): Promise<MyGateLogDto> {
    const log = await this.prismaService.myGateLog.findFirst({
      where: {
        id: Number(id),
      },
    });
    if (!log) {
      throw new HttpException('MyGate log not found', HttpStatus.NOT_FOUND);
    }
    return log;
  }

  deleteMyGateLog(id: number) {
    return this.prismaService.myGateLog.delete({
      where: {
        id: id,
      },
    });
  }
}
