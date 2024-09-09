import { Test, TestingModule } from '@nestjs/testing';
import { NotificationPriestService } from './notification-priest.service';

describe('NotificationPriestService', () => {
  let service: NotificationPriestService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationPriestService],
    }).compile();

    service = module.get<NotificationPriestService>(NotificationPriestService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
