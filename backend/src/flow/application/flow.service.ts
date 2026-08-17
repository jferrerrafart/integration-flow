import { ConflictException, Injectable, NotFoundException, } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Flow } from '../infrastructure/entities/Flow.entity';
import { FlowComponent } from '../infrastructure/entities/FlowComponent.entity';

import { FlowDto } from '../dto/flow.dto';

@Injectable()
export class FlowService {
    constructor(
        @InjectRepository(Flow)
        private readonly flowRepository: Repository<Flow>,

        @InjectRepository(FlowComponent)
        private readonly componentRepository: Repository<FlowComponent>,
    ) { }

    async create(dto: FlowDto): Promise<Flow> {
        await this.validateUniqueName(dto.name);
        this.validateFlow(dto);

        const flow = new Flow();
        flow.name = dto.name;
        flow.components = this.buildComponents(dto);

        return this.flowRepository.save(flow);
    }

    async findAll(): Promise<Flow[]> {
        return this.flowRepository.find({
            relations: ['components'],
        });
    }

    async findOne(id: number): Promise<Flow> {
        const flow = await this.flowRepository.findOne({
            where: { id },
            relations: ['components'],
        });

        if (!flow) {
            throw new NotFoundException('Flow not found');
        }

        return flow;
    }

    async update(id: number, dto: FlowDto): Promise<Flow> {
        const flow = await this.findOne(id);

        if (flow.name !== dto.name) {
            await this.validateUniqueName(dto.name);
        }

        this.validateFlow(dto);

        await this.componentRepository.delete({
            flow: { id },
        });

        flow.name = dto.name;
        flow.components = this.buildComponents(dto);

        return this.flowRepository.save(flow);
    }

    async remove(id: number): Promise<void> {
        const flow = await this.findOne(id);

        await this.flowRepository.remove(flow);
    }

    private async validateUniqueName(name: string): Promise<void> {
        const existing = await this.flowRepository.findOne({
            where: { name },
        });

        if (existing) {
            throw new ConflictException('Flow name already exists');
        }
    }

    private validateFlow(dto: FlowDto): void {
        const consumers = dto.components.filter((c) => c.role === 'consumer');
        const producers = dto.components.filter((c) => c.role === 'producer');

        if (consumers.length !== 1 || producers.length !== 1) {
            throw new ConflictException(
                'A flow must contain exactly one consumer and exactly one producer',
            );
        }
    }

    private buildComponents(dto: FlowDto): FlowComponent[] {
        return dto.components.map((component) => {
            const entity = new FlowComponent();

            entity.role = component.role;
            entity.componentId = component.componentId;
            entity.position = component.position;
            entity.configuration = component.configuration;

            return entity;
        });
    }
}
