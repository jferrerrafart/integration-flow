import { ConflictException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { ObjectLiteral, Repository } from 'typeorm';

import { Flow } from '../infrastructure/entities/Flow.entity';
import { FlowComponent } from '../infrastructure/entities/FlowComponent.entity';
import { FlowDto } from '../dto/flow.dto';
import { FlowService } from './flow.service';

type MockRepository<T extends ObjectLiteral = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const createMockRepository = <T extends ObjectLiteral = any>(): MockRepository<T> => ({
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    delete: jest.fn(),
});

function buildFlowDto(overrides: Partial<FlowDto> = {}): FlowDto {
    return {
        name: 'Scheduled file conversion',
        components: [
            {
                role: 'consumer' as any,
                componentId: 'myesb-cron-consumer',
                position: 0,
                configuration: {},
            },
            {
                role: 'producer' as any,
                componentId: 'myesb-file-producer',
                position: 1,
                configuration: {},
            },
        ],
        ...overrides,
    };
}

describe('FlowService', () => {
    let service: FlowService;
    let flowRepository: MockRepository<Flow>;
    let componentRepository: MockRepository<FlowComponent>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FlowService,
                {
                    provide: getRepositoryToken(Flow),
                    useValue: createMockRepository<Flow>(),
                },
                {
                    provide: getRepositoryToken(FlowComponent),
                    useValue: createMockRepository<FlowComponent>(),
                },
            ],
        }).compile();

        service = module.get<FlowService>(FlowService);
        flowRepository = module.get(getRepositoryToken(Flow));
        componentRepository = module.get(getRepositoryToken(FlowComponent));
    });

    describe('create', () => {
        it('rejects a duplicate flow name without saving', async () => {
            flowRepository.findOne!.mockResolvedValue({ id: 1 });

            await expect(service.create(buildFlowDto())).rejects.toThrow(
                ConflictException,
            );
            expect(flowRepository.save).not.toHaveBeenCalled();
        });

        it('rejects a flow without exactly one consumer', async () => {
            flowRepository.findOne!.mockResolvedValue(null);

            const dto = buildFlowDto({
                components: [
                    {
                        role: 'producer' as any,
                        componentId: 'myesb-file-producer',
                        position: 0,
                        configuration: {},
                    },
                ],
            });

            await expect(service.create(dto)).rejects.toThrow(
                'A flow must contain exactly one consumer',
            );
        });

        it('rejects a flow without exactly one producer', async () => {
            flowRepository.findOne!.mockResolvedValue(null);

            const dto = buildFlowDto({
                components: [
                    {
                        role: 'consumer' as any,
                        componentId: 'myesb-cron-consumer',
                        position: 0,
                        configuration: {},
                    },
                ],
            });

            await expect(service.create(dto)).rejects.toThrow(
                'A flow must contain exactly one producer',
            );
        });

        it('saves a flow with its ordered components when validation passes', async () => {
            flowRepository.findOne!.mockResolvedValue(null);
            flowRepository.save!.mockImplementation((flow) =>
                Promise.resolve({ ...flow, id: 1 }),
            );

            const dto = buildFlowDto();
            const result = await service.create(dto);

            expect(flowRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: dto.name,
                    components: expect.arrayContaining([
                        expect.objectContaining({ role: 'consumer' }),
                        expect.objectContaining({ role: 'producer' }),
                    ]),
                }),
            );
            expect(result.id).toBe(1);
        });
    });

    describe('findOne', () => {
        it('throws NotFoundException when the flow does not exist', async () => {
            flowRepository.findOne!.mockResolvedValue(null);

            await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
        });
    });

    describe('update', () => {
        it('replaces existing components before saving the new ones', async () => {
            flowRepository.findOne!
                .mockResolvedValueOnce({ id: 1, name: 'Old name', components: [] })
                .mockResolvedValueOnce(null);
            flowRepository.save!.mockImplementation((flow) => Promise.resolve(flow));

            const dto = buildFlowDto({ name: 'New name' });
            await service.update(1, dto);

            expect(componentRepository.delete).toHaveBeenCalledWith({
                flow: { id: 1 },
            });
            expect(flowRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({ name: 'New name' }),
            );
        });

        it('rejects renaming a flow to another flow\'s existing name', async () => {
            flowRepository.findOne!
                .mockResolvedValueOnce({ id: 1, name: 'Old name', components: [] })
                .mockResolvedValueOnce({ id: 2, name: 'Taken name' });

            await expect(
                service.update(1, buildFlowDto({ name: 'Taken name' })),
            ).rejects.toThrow(ConflictException);
        });
    });

    describe('remove', () => {
        it('removes an existing flow', async () => {
            const flow = { id: 1, name: 'Flow', components: [] };
            flowRepository.findOne!.mockResolvedValue(flow);

            await service.remove(1);

            expect(flowRepository.remove).toHaveBeenCalledWith(flow);
        });
    });
});
