import { Test, TestingModule } from '@nestjs/testing';
import { BelieverService } from './believer.service';

describe('BelieverService', () => {
  let service: BelieverService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BelieverService],
    }).compile();

    service = module.get<BelieverService>(BelieverService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
