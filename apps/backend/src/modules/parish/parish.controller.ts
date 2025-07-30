import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import {
  ApiAcceptedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Role, User } from '@prisma/client';
import { Request, Response } from 'express';
import { RoleEnum, Roles } from '../../app/auth/auth.decorator';
import { AuthService } from '../../app/auth/auth.service';
import { CreateParishDto, ParishDto, UpdateParishDto } from './parish.dto';
import { ParishService } from './parish.service';
import dayjs from 'dayjs';
import { first } from 'rxjs';

@Controller('parishes')
@ApiTags('Parishes')
export class ParishController {
  constructor(
    private readonly parishService: ParishService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  @Roles(RoleEnum.ADMIN, RoleEnum.ENGENEER)
  @ApiAcceptedResponse({ type: ParishDto })
  async getAllParishes(@Req() req: Request, @Res() res: Response) {
    const { user_id, role } = req.user as User;

    let parishes = null;
    if (role === Role.ADMIN) {
      parishes = await this.parishService.findAll();
    }
    if (role === Role.ADMIN) {
      parishes = await this.parishService.findAll(user_id);
    }

    if (parishes && parishes.length === 0) {
      throw new NotFoundException('None parish found!');
    }

    res.status(HttpStatus.FOUND).json(
      parishes?.map(
        (item) =>
          new ParishDto({
            ...item,
            first_name: item.first_name as string,
            phone_number: item.phone_number as string,
            address: item.address as string,
            manager_name: item.manager_name as string,
          }),
      ),
    );
  }

  @Get(':parish_id')
  @Roles(RoleEnum.ADMIN, RoleEnum.ENGENEER)
  @ApiOkResponse({
    description: 'Parish retrieved successfully.',
  })
  @ApiNotFoundResponse({
    description: 'Parish not found',
  })
  @ApiBadRequestResponse({
    description: 'Bad request. Invalid parish ID.',
  })
  @ApiAcceptedResponse({ type: ParishDto })
  async findOne(
    @Req() req: Request,
    @Res() res: Response,
    @Param('parish_id') parish_id: string,
  ) {
    const { user_id, role } = req.user as User;

    let parish = null;
    if (role === Role.ADMIN) {
      parish = await this.parishService.getCreatedparish(parish_id);
    }
    if (role === Role.ENGENEER) {
      parish = await this.parishService.getCreatedparish(parish_id, user_id);
    }
    if (!parish) {
      throw new NotFoundException('Parish not found');
    }

    const { first_name, phone_number, address, manager_name, Mass } = parish;

    const restructuredMasses = Mass.flatMap(({ price, UserRequestMass }) => {
      return UserRequestMass.map(({ purchased_at }) => {
        return {
          price,
          purchased_at,
        };
      });
    });
    const result: Record<string, object> = {};
    const startOfYear = dayjs(`${dayjs().year()}-01-01`);
    for (
      let month = 0;
      month <= dayjs().month() - startOfYear.month();
      month++
    ) {
      const startOfMonth = startOfYear.add(month, 'month').startOf('month');
      const monthKey = startOfMonth.format('DD/MM/YYYY');

      const itemsInMonth = restructuredMasses.filter(({ purchased_at }) => {
        const itemDate = dayjs(purchased_at);

        return (
          itemDate.month() === startOfMonth.month() &&
          itemDate.year() === startOfMonth.year()
        );
      });

      result[monthKey] = {
        numberOfMasses: itemsInMonth.length,
        totalAmount: itemsInMonth.reduce((acc, { price }) => acc + price, 0),
      };
    }

    res.status(HttpStatus.FOUND).json(
      new ParishDto({
        ...parish,
        first_name: first_name as string,
        phone_number: phone_number as string,
        address: address as string,
        manager_name: manager_name as string,
        statistics: result,
      }),
    );
  }

  @Patch(':parish_id')
  @Roles(RoleEnum.ADMIN, RoleEnum.ENGENEER)
  @ApiNotFoundResponse({
    description: 'Parish not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request. Invalid parish data.',
  })
  @ApiAcceptedResponse({ type: UpdateParishDto })
  async updateParish(
    @Req() req: Request,
    @Res() res: Response,
    @Param('parish_id') parish_id: string,
    @Body() updateParishDto: UpdateParishDto,
  ) {
    const { user_id, role } = req.user as User;

    let parish = null;
    if (role === Role.ADMIN) {
      parish = await this.parishService.getCreatedparish(parish_id);
    }
    if (role === Role.ENGENEER) {
      parish = await this.parishService.getCreatedparish(parish_id, user_id);
    }
    if (!parish) {
      throw new NotFoundException('Parish not found');
    }

    const updatedParish = await this.parishService.updateParish(
      parish_id,
      updateParishDto,
    );

    res.status(HttpStatus.OK).json(
      new UpdateParishDto({
        ...updatedParish,
        first_name: updatedParish.first_name as string,
        phone_number: updatedParish.phone_number as string,
        manager_name: updatedParish.manager_name as string,
        address: updatedParish.address as string,
      }),
    );
  }

  @Delete(':parish_id')
  @Roles(RoleEnum.ADMIN, RoleEnum.ENGENEER)
  @ApiOkResponse({
    description: 'Parish deleted successfully.',
  })
  @ApiNotFoundResponse({
    description: 'Parish not found',
  })
  async deletedUser(
    @Req() req: Request,
    @Res() res: Response,
    @Param('parish_id') parish_id: string,
  ) {
    const { user_id } = req.user as User;

    const parish = await this.parishService.getCreatedparish(
      user_id,
      parish_id,
    );

    if (!parish) {
      throw new NotFoundException('Parish not found');
    }

    await this.parishService.deletedParish(parish_id);

    res.status(HttpStatus.OK).json({
      message: 'user deleted successfully!',
    });
  }

  @Post('create')
  @Roles(RoleEnum.ADMIN, RoleEnum.ENGENEER)
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Parish created successfully.',
  })
  async createParish(
    @Req() req: Request,
    @Res() res: Response,
    @Body() parishpayload: CreateParishDto,
  ) {
    const { user_id } = req.user as User;

    await this.authService.registerUser(parishpayload, user_id);

    // TODO: Send email to congratulate the parish

    res.status(HttpStatus.CREATED).json({
      message: 'User created successfully!',
    });
  }
}
