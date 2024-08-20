import { Test, TestingModule } from '@nestjs/testing';
import { MassOrderService } from './mass-order.service';

describe('MassOrderService', () => {
  let service: MassOrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MassOrderService],
    }).compile();

    service = module.get<MassOrderService>(MassOrderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
