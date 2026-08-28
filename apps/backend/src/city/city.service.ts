import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CityService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createCityDto: Prisma.CityCreateInput) {
    return this.prismaService.city.create({ data: createCityDto });
  }

  async findAll() {
    return this.prismaService.city.findMany();
  }

  async findOne(city_id: string) {
    return this.prismaService.city.findUnique({ where: { city_id } });
  }

  async update(city_id: string, updateCityDto: Prisma.CityUpdateInput) {
    return this.prismaService.city.update({
      where: { city_id },
      data: updateCityDto,
    });
  }

  async remove(city_id: string) {
    return this.prismaService.city.delete({ where: { city_id } });
  }
}
