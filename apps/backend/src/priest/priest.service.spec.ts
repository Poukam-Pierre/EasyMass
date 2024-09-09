import { Test, TestingModule } from '@nestjs/testing';
import { PriestService } from './priest.service';

describe('PriestService', () => {
  let service: PriestService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PriestService],
    }).compile();

    service = module.get<PriestService>(PriestService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
