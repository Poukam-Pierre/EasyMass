import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User } from '@prisma/client';
import { Request, Response } from 'express';
import { RoleEnum, Roles } from '../../app/auth/auth.decorator';
import { AuthService } from '../../app/auth/auth.service';
import { AdminProfileDto, CreateAdminDto } from './admin.dto';
@ApiBearerAuth()
@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly authService: AuthService) {}

  @Post('/create')
  @ApiOperation({
    summary: 'Create administrator',
    description: 'Create a new administrator(engeneer) with less access',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Administrator created successfully',
  })
  @Roles(RoleEnum.ADMIN)
  async createEngeneer(
    @Req() req: Request,
    @Res() res: Response,
    @Body() createAdminPayload: CreateAdminDto,
  ) {
    const { user_id } = req.user as User;

    await this.authService.registerUser(createAdminPayload, user_id);

    res.status(HttpStatus.CREATED).json({
      message: 'User created successfully!',
    });
  }

  @Get('/profile')
  @Roles(RoleEnum.ADMIN, RoleEnum.ENGENEER)
  @ApiCreatedResponse({ type: AdminProfileDto })
  async getProfile(@Req() req: Request) {
    const { email, first_name } = req.user as User;

    return new AdminProfileDto({
      email,
      first_name: first_name as string,
    });
  }
}
