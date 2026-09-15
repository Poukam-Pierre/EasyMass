import { Body, Controller, Get, Post, Query, Request } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/decorator/roles.decorator';
import { AuthenticatedRequest } from '../common/authenticated-request';
import { CreateCorrectionDto } from './dto/create-correction.dto';
import { FindTransactionsQueryDto } from './dto/find-transactions-query.dto';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionService: TransactionsService) {}

  @Get()
  @Roles(UserRole.PARISH, UserRole.ADMIN)
  findTransactionByParish(
    @Query('parishId') parishId: string,
    @Request() request: AuthenticatedRequest
  ) {
    return this.transactionService.findAllTransactionByParish(
      parishId,
      request.user
    );
  }

  /** Paginated/filterable counterpart to the route above — additive, so the
   * unbounded route (relied on by admin-ui) keeps its existing contract. */
  @Get('/paginated')
  @Roles(UserRole.PARISH, UserRole.ADMIN)
  findTransactionByParishPaginated(
    @Query() query: FindTransactionsQueryDto,
    @Request() request: AuthenticatedRequest
  ) {
    return this.transactionService.findAllTransactionByParishPaginated(
      query.parishId,
      query,
      request.user
    );
  }

  @Post('/correction')
  @Roles(UserRole.ADMIN)
  createCorrection(
    @Body() dto: CreateCorrectionDto,
    @Request() request: AuthenticatedRequest
  ) {
    return this.transactionService.createCorrection(
      dto.ownerId,
      dto.ownerType,
      dto.amount,
      dto.note,
      request.user.id
    );
  }
}
