export class CreateMassDto {
  price: number;
  processAt: string;
  massType: MassType;
  replicate: boolean;
  createdByParish: { connect: { id: number } };
}

enum MassType {
  UNIQUE = 'UNIQUE',
  TRIDUM = 'TRIDUM',
  SEVEN = 'SEVEN',
  NOVENA = 'NOVENA',
  THIRTY = 'THIRTY',
}
