import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '@fnt-flsy/prisma-client-mygate';
import { MyGateLogDto } from './dto/mygate-log.dto';

@Injectable()
export class MyGateLogsService {
  constructor(private prismaService: PrismaService) {}
  async getDataForDeviceLogInExcel(deviceId: number,fromDate: number, toDate: number){

    const response : any= await this.prismaService.$queryRaw` select b.access_display , b.access_ref_id ,a.timestamp, a.status, a.direction, a.mygate_response from mygate_logs a INNER JOIN mygate_cards b ON a.mygate_card_id = b.id where mygate_card_id IN (select id from mygate_cards where device_id = ${deviceId}) and timestamp > ${fromDate} and timestamp  <= ${toDate};`


    const responseData = []
    responseData.push([
      'access_display',
      'access_ref_id',
      'timestamp',
      'status',
      'direction',
      'mg_resonse'
    ])
    

    for(const data of response){
      const lg = JSON.stringify(data['mygate_response']);
      responseData.push([data['access_display'], data['access_ref_id'], data['timestamp'], data['status'], data['direction'],lg ])
    }
    return responseData
    
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
