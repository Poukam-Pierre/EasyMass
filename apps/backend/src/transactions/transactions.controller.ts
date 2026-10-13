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

  /** Paginated/filterable — backs the finance tables in both admin-ui and
   * parish, plus admin-ui's parish-detail transactions tab. */
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
      dto.password,
      request.user.id
    );
  }
}
