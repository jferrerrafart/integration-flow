import { Injectable } from '@nestjs/common';

import { FlowDto } from '../dto/flow.dto';
import { Flow } from '../infrastructure/entities/Flow.entity';
import { FlowService } from './flow.service';

@Injectable()
export class FlowFacade {
    constructor(
        private readonly flowService: FlowService,
    ) { }

    create(dto: FlowDto): Promise<Flow> {
        return this.flowService.create(dto);
    }

    findAll(): Promise<Flow[]> {
        return this.flowService.findAll();
    }

    findOne(id: number): Promise<Flow> {
        return this.flowService.findOne(id);
    }

    update(id: number, dto: FlowDto): Promise<Flow> {
        return this.flowService.update(id, dto);
    }

    remove(id: number): Promise<void> {
        return this.flowService.remove(id);
    }
}