import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guard/auth.guards';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionService: TransactionsService) {}

  @Get()
  @UseGuards(AuthGuard)
  findTransactionByParish(@Query('parishId') parishId: string) {
    return this.transactionService.findAllTransactionByParish(parishId);
  }
}
