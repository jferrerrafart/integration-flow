import { Module } from '@nestjs/common';

import { ComponentDefinitionService } from './application/component-definition.service';
import { ComponentDefinitionFacade } from './application/component-definition.facade';
import { ComponentDefinitionController } from './infrastructure/controllers/component-definition.controller';

@Module({
  controllers: [ComponentDefinitionController],
  providers: [ComponentDefinitionFacade, ComponentDefinitionService]
})
export class ComponentDefinitionModule { }
