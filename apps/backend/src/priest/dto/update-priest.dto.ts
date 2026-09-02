import { PartialType } from '@nestjs/mapped-types';
import { CreatePriestDto } from './create-priest.dto';

export class UpdatePriestDto extends PartialType(CreatePriestDto) {}
