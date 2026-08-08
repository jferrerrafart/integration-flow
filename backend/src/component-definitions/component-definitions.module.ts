import { Module } from '@nestjs/common';
import { ComponentDefinitionsController } from './infrastructure/controllers/component-definitions.controller';
import { ComponentDefinitionService } from './application/component-definitions.service';
import { ComponentDefinitionFacade } from './application/component-definitions.facade';

@Module({
  controllers: [ComponentDefinitionsController],
  providers: [ComponentDefinitionFacade, ComponentDefinitionService]
})
export class ComponentDefinitionsModule { }
