import { Injectable } from '@nestjs/common';

import { FlowDto } from '../dto/flow.dto';
import { FlowResponseDto } from '../dto/flow-response.dto';
import { FlowService } from './flow.service';

@Injectable()
export class FlowFacade {
    constructor(
        private readonly flowService: FlowService,
    ) { }

    create(dto: FlowDto): Promise<FlowResponseDto> {
        return this.flowService.create(dto);
    }

    findAll(): Promise<FlowResponseDto[]> {
        return this.flowService.findAll();
    }

    findOne(id: number): Promise<FlowResponseDto> {
        return this.flowService.findOne(id);
    }

    update(id: number, dto: FlowDto): Promise<FlowResponseDto> {
        return this.flowService.update(id, dto);
    }

    remove(id: number): Promise<void> {
        return this.flowService.remove(id);
    }
}