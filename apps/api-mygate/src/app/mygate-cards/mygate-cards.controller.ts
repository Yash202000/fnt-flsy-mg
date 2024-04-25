import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { MyGateCardsService } from './mygate-cards.service';
import {
  ApiTags,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { UserAuthGuard } from '../core/auth/user-auth.guard';
import {
  AddMyGateCardDto,
  EditMyGateCardDto,
  MyGateCardDto,
} from './dto/mygate-card.dto';

@ApiTags('mygate-cards')
@UseGuards(UserAuthGuard)
@Controller('mygate-cards')
export class MyGateCardsController {
  constructor(private myGateCardsService: MyGateCardsService) {}

  @ApiOperation({ summary: 'Get all cards' })
  @ApiResponse({ status: 200, description: 'Success', type: [MyGateCardDto] })
  @Get()
  getMyGateCards(): Promise<MyGateCardDto[]> {
    return this.myGateCardsService.getMyGateCards();
  }

  @ApiOperation({ summary: 'Get Card by id' })
  @ApiParam({ name: 'id', type: 'number', description: 'Example ID: 1' })
  @ApiResponse({ status: 200, description: 'Success', type: MyGateCardDto })
  @Get(':id')
  getMyGateCard(@Param('id') id: number): Promise<MyGateCardDto> {
    return this.myGateCardsService.getMyGateCard(+id);
  }

  @ApiOperation({ summary: 'Add Card' })
  @ApiBody({ type: AddMyGateCardDto })
  @ApiResponse({ status: 201, description: 'Success', type: MyGateCardDto })
  @Post()
  addTag(@Body() addMyGateCardDto: AddMyGateCardDto) {
    return this.myGateCardsService.addMyGateCard(addMyGateCardDto);
  }

  @ApiOperation({ summary: 'Update Card Information' })
  @ApiBody({ type: EditMyGateCardDto })
  @ApiResponse({ status: 201, description: 'Success', type: MyGateCardDto })
  @Put(':id')
  editTag(
    @Param('id') id: number,
    @Body() editMyGateCardDto: EditMyGateCardDto
  ): Promise<MyGateCardDto> {
    return this.myGateCardsService.editMyGateCard(+id, editMyGateCardDto);
  }

  @ApiOperation({ summary: 'Delete Card Information' })
  @ApiParam({ name: 'id', type: 'number', description: 'Example ID: 1' })
  @ApiResponse({ status: 204, description: 'Success', type: MyGateCardDto })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  deleteMyGateCard(@Param('id') id: number): Promise<MyGateCardDto> {
    return this.myGateCardsService.deleteMyGateCard(+id);
  }
}
