import { Test, TestingModule } from '@nestjs/testing';
import { ComponentDefinitionsService } from './component-definitions.service';

describe('ComponentDefinitionsService', () => {
  let service: ComponentDefinitionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ComponentDefinitionsService],
    }).compile();

    service = module.get<ComponentDefinitionsService>(ComponentDefinitionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
