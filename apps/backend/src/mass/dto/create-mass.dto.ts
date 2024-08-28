export class CreateMassDto {
  price: number;
  processAt: Date;
  intension: string;
  massType: MassType;
}

enum MassType {
  UNIQUE = 'UNIQUE',
  TRIDUM = 'TRIDUM',
  SEVEN = 'SEVEN',
  NOVENA = 'NOVENA',
  THIRTY = 'THIRTY',
}
