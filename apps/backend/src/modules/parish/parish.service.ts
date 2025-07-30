import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateParishDto } from './parish.dto';

@Injectable()
export class ParishService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(user_id?: string) {
    return await this.prismaService.user.findMany({
      where: {
        role: Role.PARISH,
        ...(user_id && {
          created_by: user_id,
        }),
      },
    });
  }

  /**
   * @description Updates a parish by its id, with given payload.
   *              Note that this does not update the parish's city.
   * @param {string} user_id - The id of the parish to update.
   * @param {UpdateParishDto} payload - The data to update the parish with.
   * @returns {Promise<Parish>} The updated parish.
   */
  // TODO: Should be send to USER module cause it's a user process
  async updateParish(user_id: string, payload: UpdateParishDto) {
    return await this.prismaService.user.update({
      where: {
        user_id,
      },
      data: {
        ...payload,
      },
    });
  }

  /**
   * @description Soft-deletes a parish by setting is_active to false
   *              and adding a deleted_at timestamp.
   * @param {string} user_id - The id of the parish to delete.
   * @returns {Promise<void>}
   */
  async deletedParish(user_id: string) {
    await this.prismaService.user.update({
      where: {
        user_id,
        role: Role.PARISH,
      },
      data: {
        is_active: false,
        deleted_at: new Date(),
      },
    });
  }

  /**
   * @description Fetches a parish by its id, optionally filtered by created_by.
   * @param {string} parish_id - The id of the parish to fetch.
   * @param {string} [created_by] - The id of the user that created the parish,
   *                                if specified, the method will only return
   *                                the parish if it was created by the user.
   * @returns {Promise<User>} - The fetched parish.
   */
  async getCreatedparish(parish_id: string, created_by?: string) {
    return await this.prismaService.user.findFirst({
      where: {
        user_id: parish_id,
        is_active: true,
        role: Role.PARISH,
        ...(created_by && {
          created_by,
        }),
      },
      include: {
        Mass: {
          include: {
            UserRequestMass: true,
          },
        },
      },
    });
  }
}
