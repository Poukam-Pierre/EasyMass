export class CreateMassDto {
  price: number;
  processAt: Date;
  massType: MassType;
  replicate: boolean;
  createByParish: { connect: { id: number } };
}

enum MassType {
  UNIQUE = 'UNIQUE',
  TRIDUM = 'TRIDUM',
  SEVEN = 'SEVEN',
  NOVENA = 'NOVENA',
  THIRTY = 'THIRTY',
}
