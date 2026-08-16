import { NotFoundException } from '@nestjs/common';

import { FlowComponentRole } from 'src/shared/enums/flow-component-role.enum';
import { ComponentDefinitionService } from './component-definition.service';

describe('ComponentDefinitionService', () => {
    let service: ComponentDefinitionService;

    beforeEach(() => {
        service = new ComponentDefinitionService();
    });

    describe('getComponentListByRole', () => {
        it('parses the consumer index and flags which types have a local definition file', () => {
            const consumers = service.getComponentListByRole(
                FlowComponentRole.CONSUMER,
            );

            const scheduler = consumers.find(
                (component) => component.id === 'myesb-cron-consumer',
            );
            const restListener = consumers.find(
                (component) => component.id === 'myesb-rest-consumer',
            );

            expect(scheduler).toEqual(
                expect.objectContaining({
                    name: 'Scheduler',
                    type: 'myesb-cron-consumerType',
                    available: true,
                }),
            );
            expect(restListener?.available).toBe(false);
        });

        it('parses the service index for the challenge-relevant File Reader Service', () => {
            const services = service.getComponentListByRole(
                FlowComponentRole.SERVICE,
            );

            expect(services).toContainEqual(
                expect.objectContaining({
                    id: 'myesb-filereader-service',
                    name: 'File Reader Service',
                    available: true,
                }),
            );
        });

        it('parses the producer index for the challenge-relevant File Drop', () => {
            const producers = service.getComponentListByRole(
                FlowComponentRole.PRODUCER,
            );

            expect(producers).toContainEqual(
                expect.objectContaining({
                    id: 'myesb-file-producer',
                    name: 'File Drop',
                    available: true,
                }),
            );
        });
    });

    describe('getConfigurationDefinition', () => {
        it('reads and returns the configuration fields for an available type', () => {
            const result = service.getConfigurationDefinition(
                FlowComponentRole.CONSUMER,
                'myesb-cron-consumerType',
            );

            expect(Object.keys(result.configuration)).toEqual(
                expect.arrayContaining(['cron-expression', 'id', 'autostart']),
            );
        });

        it('throws NotFoundException when the type has no local definition file', () => {
            expect(() =>
                service.getConfigurationDefinition(
                    FlowComponentRole.CONSUMER,
                    'myesb-rest-consumerType',
                ),
            ).toThrow(NotFoundException);
        });

        it('throws NotFoundException when the type does not belong to the role', () => {
            expect(() =>
                service.getConfigurationDefinition(
                    FlowComponentRole.CONSUMER,
                    'myesb-file-producerType',
                ),
            ).toThrow(NotFoundException);
        });
    });
});
