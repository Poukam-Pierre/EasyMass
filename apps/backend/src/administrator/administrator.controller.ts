import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AdminGuard } from '../auth/guard/admin.guards';
import { AdministratorService } from './administrator.service';
import { ROLE, Role } from '../auth/decorator/public.decorator';

@Controller('administrator')
@UseGuards(AdminGuard)
export class AdministratorController {
  constructor(private readonly administratorService: AdministratorService) {}

  @ApiOperation({
    summary: 'Get administrator data',
  })
  @ApiResponse({
    status: 200,
    description: 'Administrator found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Token is missing or invalid.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden. You do not have permission to access this resource.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error. An unexpected error occurred.',
  })
  @Role(ROLE.ADMIN)
  @Role(ROLE.ENGENEER)
  @Get()
  getAdministrator(@Request() request) {
    return this.administratorService.findOne(request);
  }
}
