import { Module } from '@nestjs/common';
import { FlowsController } from './infrastructure/controllers/flows.controller';
import { CreateFlowService } from './application/services/create-flow.service';
import { DeleteFlowService } from './application/services/delete-flow.service';
import { UpdateFlowService } from './application/services/update-flow.service';
import { GetFlowService } from './application/services/get-flow.service';
import { ListFlowsService } from './application/services/list-flows.service';

@Module({
  controllers: [FlowsController],
  providers: [CreateFlowService, DeleteFlowService, UpdateFlowService, GetFlowService, ListFlowsService]
})
export class FlowsModule {}
