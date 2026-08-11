import { Injectable } from '@angular/core';

import { FlowComponentDto } from '../dto/flow-component.dto';
import { FlowDto } from '../dto/flow.dto';
import { FlowResponseDto } from '../dto/flow-response.dto';

export interface ConfiguredComponent {
    componentId: string;
    configuration: Record<string, unknown>;
}

export interface ServiceSlot {
    id: number;
    configured: ConfiguredComponent | null;
}

export interface FlowEditorState {
    consumer: ConfiguredComponent | null;
    services: ServiceSlot[];
    producer: ConfiguredComponent | null;
}

export interface FlowEditorPayloadResult {
    payload: FlowDto | null;
    errorMessage: string | null;
}

@Injectable({
    providedIn: 'root',
})
export class FlowEditorService {
    createServiceSlot(id: number): ServiceSlot {
        return {
            id,
            configured: null,
        };
    }

    buildInitialState(
        flow: FlowResponseDto | null,
        startFromId: number,
    ): FlowEditorState {
        if (!flow) {
            return {
                consumer: null,
                services: [],
                producer: null,
            };
        }

        const consumer = flow.components.find(
            (component) => component.role === 'consumer',
        );
        const producer = flow.components.find(
            (component) => component.role === 'producer',
        );
        const services = flow.components
            .filter((component) => component.role === 'service')
            .sort((a, b) => a.position - b.position);

        const initialServices = services.map((service, index) => ({
            id: startFromId + index,
            configured: {
                componentId: service.componentId,
                configuration: service.configuration,
            },
        }));

        return {
            consumer: consumer
                ? {
                    componentId: consumer.componentId,
                    configuration: consumer.configuration,
                }
                : null,
            services: initialServices,
            producer: producer
                ? {
                    componentId: producer.componentId,
                    configuration: producer.configuration,
                }
                : null,
        };
    }

    buildPayload(name: string, state: FlowEditorState): FlowEditorPayloadResult {
        if (!state.consumer || !state.producer) {
            return {
                payload: null,
                errorMessage:
                    'Select one consumer and one producer before saving the flow.',
            };
        }

        const components: FlowComponentDto[] = [
            {
                role: 'consumer',
                componentId: state.consumer.componentId,
                position: 0,
                configuration: state.consumer.configuration,
            },
        ];

        const configuredServices = state.services
            .map((slot) => slot.configured)
            .filter(
                (service): service is ConfiguredComponent => service !== null,
            );

        configuredServices.forEach((service, index) => {
            components.push({
                role: 'service',
                componentId: service.componentId,
                position: index + 1,
                configuration: service.configuration,
            });
        });

        components.push({
            role: 'producer',
            componentId: state.producer.componentId,
            position: components.length,
            configuration: state.producer.configuration,
        });

        return {
            payload: {
                name: name.trim(),
                components,
            },
            errorMessage: null,
        };
    }
}
