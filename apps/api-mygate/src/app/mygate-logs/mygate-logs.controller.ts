import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { MyGateLogsService } from './mygate-logs.service';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserAuthGuard } from '../core/auth/user-auth.guard';
import { MyGateLogDto } from './dto/mygate-log.dto';
import * as xlsx from 'xlsx';

@ApiTags('mygate-logs')
@UseGuards(UserAuthGuard)
@Controller('mygate-logs')
export class MyGateLogsController {
  constructor(private myGateLogsService: MyGateLogsService) {}

  // TODO: add filters by device, by card, by time, by notification
  @ApiOperation({ summary: 'Get all logs' })
  @ApiResponse({ status: 200, description: 'Success', type: [MyGateLogDto] })
  @Get()
  getMyGateLogs(
    @Query('myGateCardId') myGateCardId?: number
  ): Promise<MyGateLogDto[]> {
    return this.myGateLogsService.getMyGateLogs(
      myGateCardId === undefined ? undefined : +myGateCardId
    );
  }


  @ApiOperation({summary: "export residents data by society"})
  @ApiQuery({ name: 'device_id', description: 'Device ID', type: String  ,required: true })
  @ApiQuery({ name: 'from', description: 'from timestamp', type: Number,required: true })
  @ApiQuery({ name: 'to', description: 'to timestamp', type: Number,required: true })
  @Get('report')
  @HttpCode(HttpStatus.OK)
  async exportDeviceLogInExcel( 
  @Query('device_id') deviceId: number,
  @Query('from') fromDate: number,
  @Query('to') toDate: number,@Res() res) {
    const data = await this.myGateLogsService.getDataForDeviceLogInExcel(+deviceId, +fromDate, +toDate);

    // Create a workbook and add a worksheet
    const ws = xlsx.utils.aoa_to_sheet(data);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Sheet 1');

    // Save the workbook to a buffer
    const buffer = xlsx.write(wb, { bookType: 'xlsx', type: 'buffer' });

    // Set the response headers
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=logs.xlsx',
    });

    // Send the buffer as the response
    res.send(buffer);
  }

  @Get(':id')
  getMyGateLog(@Param('id') id: number): Promise<MyGateLogDto> {
    return this.myGateLogsService.getMyGateLog(+id);
  }

  @ApiOperation({ summary: 'Delete the log' })
  @ApiParam({ name: 'id', type: 'number', description: 'Example ID: 1' })
  @ApiResponse({ status: 204, description: 'Success', type: MyGateLogDto })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  deleteMyGateLog(@Param('id') id: number): Promise<MyGateLogDto> {
    return this.myGateLogsService.deleteMyGateLog(+id);
  }
}
