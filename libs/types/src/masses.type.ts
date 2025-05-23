import { Dayjs } from 'dayjs';

export enum MassTypeEnum {
  One = 'unique',
  Triduum = 'triduum',
  Seven = 'seven',
  Novena = 'novena',
  Thirty = 'thirty',
}

export interface MassGroupCategory {
  label: MassTypeEnum;
  valueOrder: number;
}

export interface ReplicateMassDto {
  canReplicate: boolean;
  period: ReplicationPeriodEnum;
}

export enum ReplicationPeriodEnum {
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

export interface TableMassOwnerData {
  id: number;
  dayOfMass: Dayjs | null;
  massTime: Dayjs | null;
  createdAt: Dayjs;
  price: number;
  status?: string;
}
