import { Test, TestingModule } from '@nestjs/testing';
import { NotificationParishService } from './notification-parish.service';

describe('NotificationParishService', () => {
  let service: NotificationParishService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationParishService],
    }).compile();

    service = module.get<NotificationParishService>(NotificationParishService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
