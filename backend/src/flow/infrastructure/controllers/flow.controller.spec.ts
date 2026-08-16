import { Test, TestingModule } from '@nestjs/testing';

import { FlowFacade } from '../../application/flow.facade';
import { FlowController } from './flow.controller';
import { FlowDto } from '../../dto/flow.dto';

describe('FlowController', () => {
    let controller: FlowController;
    let facade: Partial<Record<keyof FlowFacade, jest.Mock>>;

    beforeEach(async () => {
        facade = {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [FlowController],
            providers: [{ provide: FlowFacade, useValue: facade }],
        }).compile();

        controller = module.get<FlowController>(FlowController);
    });

    it('delegates flow creation to the facade', () => {
        const dto = { name: 'Flow', components: [] } as FlowDto;
        controller.create(dto);

        expect(facade.create).toHaveBeenCalledWith(dto);
    });

    it('delegates listing all flows to the facade', () => {
        controller.findAll();

        expect(facade.findAll).toHaveBeenCalled();
    });

    it('delegates retrieving one flow to the facade', () => {
        controller.findOne(1);

        expect(facade.findOne).toHaveBeenCalledWith(1);
    });

    it('delegates updating a flow to the facade', () => {
        const dto = { name: 'Flow', components: [] } as FlowDto;
        controller.update(1, dto);

        expect(facade.update).toHaveBeenCalledWith(1, dto);
    });

    it('delegates removing a flow to the facade', () => {
        controller.remove(1);

        expect(facade.remove).toHaveBeenCalledWith(1);
    });
});
