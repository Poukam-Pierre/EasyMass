import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { AuthGuard } from '../auth/guard/auth.guards';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionService: TransactionsService) {}

  @Get()
  @UseGuards(AuthGuard)
  findTransactionByParish(@Param('parishId') parishId: string) {
    return this.transactionService.findAllTransactionByParish(+parishId);
  }
}
