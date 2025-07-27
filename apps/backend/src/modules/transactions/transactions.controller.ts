import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { AuthGuard } from '../../app/auth/guard/auth.guards';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionService: TransactionsService) {}

  @Get()
  @UseGuards(AuthGuard)
  findTransactionByParish(@Query('parishId') parishId: string) {
    return this.transactionService.findAllTransactionByParish(+parishId);
  }
}
