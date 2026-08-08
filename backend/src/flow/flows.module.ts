import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Flow } from './infrastructure/entities/Flow.entity';
import { FlowComponent } from './infrastructure/entities/FlowComponent.entity';
//import { FlowRepository } from './infrastructure/repositories/flow.repository';
import { FlowFacade } from './application/flow.facade';
import { FlowService } from './application/flow.service';
import { FlowController } from './infrastructure/controllers/flow.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Flow, FlowComponent])],
  controllers: [FlowController],
  providers: [/* FlowRepository, */ FlowFacade, FlowService],
  exports: [/* FlowRepository, */ FlowFacade],
})
export class FlowsModule { }
