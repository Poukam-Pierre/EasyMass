import { Body, Controller, Get, Post, Query, Request } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/decorator/roles.decorator';
import { CreateCorrectionDto } from './dto/create-correction.dto';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionService: TransactionsService) {}

  @Get()
  findTransactionByParish(@Query('parishId') parishId: string) {
    return this.transactionService.findAllTransactionByParish(parishId);
  }

  @Post('/correction')
  @Roles(UserRole.ADMIN)
  createCorrection(@Body() dto: CreateCorrectionDto, @Request() request) {
    return this.transactionService.createCorrection(
      dto.ownerId,
      dto.ownerType,
      dto.amount,
      dto.note,
      request.user.id
    );
  }
}
