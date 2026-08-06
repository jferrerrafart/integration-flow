import { Test, TestingModule } from '@nestjs/testing';
import { ComponentDefinitionsController } from './component-definitions.controller';

describe('ComponentDefinitionsController', () => {
  let controller: ComponentDefinitionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComponentDefinitionsController],
    }).compile();

    controller = module.get<ComponentDefinitionsController>(ComponentDefinitionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
