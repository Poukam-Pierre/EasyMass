import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { ParishDataDto, UpdateParishData } from './dto/parishData.dto';
import { SignUpParishDto } from './dto/signupParish.dto';

@Injectable()
export class ParishService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(parishData: SignUpParishDto, request) {
    const { city, ...rest } = parishData;
    const { id } = request.user;

    try {
      await this.prismaService.parish.create({
        data: {
          password: await bcrypt.hash('Parish2025*', 10),
          ...rest,
          city: {
            connect: {
              city_id: city.city_id,
            },
          },
          createdByAdmin: {
            connect: {
              id,
            },
          },
        },
      });

      const WELCOME_MESSAGE = `Dear Parish,

      We are delighted to welcome you to **Easy Messe**, your trusted platform for accessing Mass schedules,\n
      parish updates, and spiritual resources. Thank you for registering—we’re honored to be part of your faith journey.\n\n
      **Your temporary password is:** Parish2025*

      For security reasons, we **strongly recommend** changing this password upon your first login.\n\n
      If you have any questions or need assistance, feel free to reach out. May this platform enrich your connection with your parish community.\n\n
      Blessings\n,
      Easymesse team\n
      easymesse+support@gmail.com`;

      // TODO: Send by mail to the such parsh email
      console.log(WELCOME_MESSAGE);
      return {
        statusCode: 201,
        message: ' Parish created successfully',
      };
    } catch (error) {
      console.log('Error while trying to create parish :', error);
      throw new InternalServerErrorException('serverError');
    }
  }

  // TODO: Set up the JSDocs
  async findAll() {
    try {
      const parishes = await this.prismaService.parish.findMany({
        where: {
          is_deleted: false,
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          manager_name: true,
          createdAt: true,
          balance: true,
          city: {
            select: {
              city_id: true,
              city_name: true,
            },
          },
        },
      });
      const strurctureParishData = parishes.map(
        ({
          id,
          name,
          city,
          email,
          phone: contact,
          manager_name: leadName,
          createdAt,
          balance,
        }) => {
          return {
            id,
            name,
            city,
            email,
            contact,
            leadName,
            createdAt,
            balance,
          };
        }
      );
      return {
        statusCode: 200,
        parishes: strurctureParishData,
      };
    } catch (error) {
      console.log('Error while fetching parishes:', error);
      throw new InternalServerErrorException('serverError');
    }
  }

  async findParish(id: number) {
    return await this.prismaService.parish.findUnique({
      where: {
        id,
      },
    });
  }

  async findOneByMail(email: string) {
    return this.prismaService.parish.findUnique({
      where: {
        email,
      },
    });
  }

  /**
   * This function updates a parish by its ID.
   * @param id - The ID of the parish to update.
   * @param updateParishDto - The data to update the parish with.
   * @returns The updated parish object.
   */
  async updateParish(id: number, updateParishDto: UpdateParishData) {
    const { city, ...rest } = updateParishDto;

    try {
      await this.prismaService.parish.update({
        where: {
          id,
        },
        data: {
          ...rest,
          ...(city &&
            Object.values(city).length !== 0 && {
              city: {
                connect: {
                  city_id: city.city_id,
                },
              },
            }),
        },
      });

      return {
        statusCode: 200,
        message: 'parishUpdated',
      };
    } catch (error) {
      console.log('Error while updating parish data :', error);
      throw new InternalServerErrorException('serverError');
    }
  }

  /**
   * This function deletes a parish by setting the is_deleted field to true
   * and updating the deletedByAdmin and deletedAt fields.
   * @param id - The ID of the parish to delete.
   * @param request - The request object containing user information.
   * @returns A success message if the deletion was successful.
   */
  async remove(id: number, request) {
    const { id: admin_id } = request.user;

    try {
      await this.prismaService.parish.update({
        where: {
          id,
        },
        data: {
          is_deleted: true,
          deletedByAdmin: {
            connect: {
              id: admin_id,
            },
          },
          deletedAt: new Date(),
        },
      });

      return {
        statusCode: 200,
        message: 'parishDeleted',
      };
    } catch (error) {
      console.log('Error while deleting parish:', error);
      throw new InternalServerErrorException('serverError');
    }
  }

  /**
   * This function passes the input and request to other validation function
   * and just waits for the result to perfom error action. If any error occurs
   * the function passes the result to signIn function and returns the result.
   * @param input receiving value from client side
   * @param request request object processed in the guard function
   * @returns successfull result object
   */
  async createParish(
    input: SignUpParishDto,
    request
  ): Promise<ParishDataDto | unknown> {
    const user = await this.credentialsParishValidation(input, request);

    if (!user) {
      throw new BadRequestException('Bad Request', {
        cause: new Error(),
        description: 'This account is already in use.',
      });
    }

    return { code: 200, message: 'New parish created successfully' };
  }

  /**
   * This function verifies that the input from the client exists in the database. If so,
   * the function returns null. Otherwise, the function hash password and creates a new
   * user account. Then returns the user object created.
   * @param input
   * @param request
   * @returns
   */
  async credentialsParishValidation(input: SignUpParishDto, request) {
    const { email } = input;
    try {
      const user = await this.findOneByMail(email);

      if (user) return null;

      await this.create(input, request);

      return {
        statusCode: 200,
        message: 'parishCreated',
      };
    } catch (error) {
      console.log('Error appear while processing creation of parish');
      throw new InternalServerErrorException('serverError');
    }
  }

  async findAllMasses() {
    const parishWithItsOwnMasses = await this.prismaService.parish.findMany({
      select: {
        name: true,
        mass: {
          select: {
            price: true,
            processAt: true,
            massType: true,
          },
        },
      },
    });

    parishWithItsOwnMasses.forEach((parishData) => {
      parishData.mass.map((massData) => {
        massData['dateTime'] = new Date(massData.processAt);
        delete massData['processAt'];
      });
      parishData['massData'] = parishData.mass;
      delete parishData['mass'];
    });

    return parishWithItsOwnMasses;
  }

  // TODO: Set up JSDocs
  async findAllCities() {
    try {
      const cities = await this.prismaService.city.findMany({
        select: {
          city_id: true,
          city_name: true,
        },
      });

      return {
        statusCode: 200,
        cities,
      };
    } catch (error) {
      console.log('Error while retrieving cities :', error);
      throw new InternalServerErrorException('serverError');
    }
  }
}
