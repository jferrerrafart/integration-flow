/* import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Flow } from '../entities/Flow.entity';

@Injectable()
export class FlowRepository {
    constructor(
        @InjectRepository(Flow)
        private readonly repository: Repository<Flow>,
    ) { }

    findAll(): Promise<Flow[]> {
        return this.repository.find({
            relations: ['components'],
        });
    }

    findById(id: number): Promise<Flow | null> {
        return this.repository.findOne({
            where: { id },
            relations: ['components'],
            order: {
                components: {
                    position: 'ASC',
                },
            },
        });
    }

    findByName(name: string): Promise<Flow | null> {
        return this.repository.findOne({
            where: { name },
            relations: ['components'],
        });
    }

    save(flow: Flow): Promise<Flow> {
        return this.repository.save(flow);
    }

    async delete(id: number): Promise<void> {
        await this.repository.delete(id);
    }
} */