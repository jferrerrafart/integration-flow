import { Module } from '@nestjs/common';
import { ComponentDefinitionsController } from './infrastructure/controllers/component-definitions.controller';
import { ComponentDefinitionsService } from './application/services/component-definitions.service';

@Module({
  controllers: [ComponentDefinitionsController],
  providers: [ComponentDefinitionsService]
})
export class ComponentDefinitionsModule {}
