import { MassType } from '@prisma/client';

export class CreateMassDto {
  price: number;
  processAt: string;
  massType: MassType;
  replicate: boolean;
  parish?: { connect: { parishId: string } };
}
