import { Component, computed, inject, OnInit, signal } from '@angular/core';
import {
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
    MAT_DIALOG_DATA,
    MatDialogModule,
    MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FlowComponentConfiguratorComponent } from '../flow-component-configurator/flow-component-configurator.component';

import { ComponentDefinitionFacade } from '../../../../component-definition/aplication/component-definition.facade';
import { ComponentDefinitionDto } from '../../../../component-definition/dto/component-definition.dto';
import { FlowFacade } from '../../../aplication/flow.facade';
import { FlowComponentDto } from '../../../dto/flow-component.dto';
import { FlowDto } from '../../../dto/flow.dto';
import { FlowResponseDto } from '../../../dto/flow-response.dto';
import { FlowComponentRole } from '../../../../shared/types/flow-component-role';
import { getHttpErrorMessage } from '../../../../shared/utils/http-error.util';

interface ConfiguredComponent {
    component: ComponentDefinitionDto;
    configuration: Record<string, unknown>;
}

interface RequiredConfiguredComponents {
    consumer: ConfiguredComponent | null;
    producer: ConfiguredComponent | null;
}

interface ServiceSlot {
    id: number;
    initialComponentId: string | null;
    initialConfiguration: Record<string, unknown> | null;
}

export interface FlowEditorDialogData {
    flow?: FlowResponseDto;
}

@Component({
    selector: 'app-flow-editor',
    standalone: true,
    imports: [
        FlowComponentConfiguratorComponent,
        MatButtonModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
    ],
    templateUrl: './flow-editor.component.html',
    styleUrl: './flow-editor.component.scss',
})
export class FlowEditorComponent implements OnInit {
    private readonly componentDefinitionFacade =
        inject(ComponentDefinitionFacade);
    private readonly flowFacade = inject(FlowFacade);
    private readonly dialogRef =
        inject(MatDialogRef<FlowEditorComponent>);
    private readonly dialogData =
        inject<FlowEditorDialogData>(MAT_DIALOG_DATA, {
            optional: true,
        });

    readonly consumers = computed(() =>
        this.componentDefinitionFacade.getComponentsByRole('consumer'));
    readonly services = computed(() =>
        this.componentDefinitionFacade.getComponentsByRole('service'));
    readonly producers = computed(() =>
        this.componentDefinitionFacade.getComponentsByRole('producer'));

    readonly loading = signal(false);
    readonly errorMessage = signal<string | null>(null);

    readonly flowForm = new FormGroup({
        name: new FormControl('', {
            nonNullable: true,
            validators: [Validators.required],
        }),
    });

    readonly configured = signal<RequiredConfiguredComponents>({
        consumer: null,
        producer: null,
    });

    readonly configuredServices = signal<Record<number, ConfiguredComponent | null>>({});
    readonly serviceSlots = signal<ServiceSlot[]>([]);
    private nextServiceSlotId = 1;

    readonly editingFlow = this.dialogData?.flow ?? null;

    get dialogTitle(): string {
        return this.editingFlow
            ? 'Edit Flow'
            : 'New Flow';
    }

    ngOnInit(): void {
        void this.loadComponentDefinitions();

        if (this.editingFlow) {
            this.flowForm.patchValue({
                name: this.editingFlow.name,
            });

            const services = this.editingFlow.components
                .filter((component) => component.role === 'service')
                .sort((a, b) => a.position - b.position);

            if (services.length > 0) {
                const slots = services.map((service) => ({
                    id: this.nextServiceSlotId++,
                    initialComponentId: service.componentId,
                    initialConfiguration: service.configuration,
                }));

                this.serviceSlots.set(slots);
                return;
            }
        }

        this.addServiceSlot();
    }

    onComponentConfigured(
        role: FlowComponentRole,
        configuredComponent: ConfiguredComponent,
    ): void {
        this.configured.update((state) => ({
            ...state,
            [role]: configuredComponent,
        }));
    }

    onServiceConfigured(
        slotId: number,
        configuredComponent: ConfiguredComponent,
    ): void {
        this.configuredServices.update((state) => ({
            ...state,
            [slotId]: configuredComponent,
        }));
    }

    addServiceSlot(): void {
        const slot: ServiceSlot = {
            id: this.nextServiceSlotId++,
            initialComponentId: null,
            initialConfiguration: null,
        };

        this.serviceSlots.update((slots) => [
            ...slots,
            slot,
        ]);
    }

    removeServiceSlot(slotId: number): void {
        this.serviceSlots.update((slots) => slots
            .filter((slot) => slot.id !== slotId));

        this.configuredServices.update((state) => {
            const nextState = { ...state };
            delete nextState[slotId];
            return nextState;
        });
    }

    trackByServiceSlotId(_: number, slot: ServiceSlot): number {
        return slot.id;
    }

    initialComponentIdFor(
        role: FlowComponentRole,
    ): string | null {
        const component = this.initialComponentFor(role);

        return component?.componentId ?? null;
    }

    initialConfigurationFor(
        role: FlowComponentRole,
    ): Record<string, unknown> | null {
        const component = this.initialComponentFor(role);

        return component?.configuration ?? null;
    }

    async createFlow(): Promise<void> {
        if (this.flowForm.invalid) {
            this.flowForm.markAllAsTouched();
            return;
        }

        const payload = this.buildPayload();

        if (!payload) {
            this.errorMessage.set(
                'Select one consumer and one producer before saving the flow.',
            );
            return;
        }

        this.loading.set(true);
        this.errorMessage.set(null);

        try {
            if (this.editingFlow) {
                await this.flowFacade.update(this.editingFlow.id, payload);
            } else {
                await this.flowFacade.create(payload);
            }

            this.dialogRef.close(true);
        } catch (error: unknown) {
            this.errorMessage.set(
                getHttpErrorMessage(
                    error,
                    'Unable to save flow. Check the data and retry.',
                ),
            );
        } finally {
            this.loading.set(false);
        }
    }

    private buildPayload(): FlowDto | null {
        const configured = this.configured();
        const consumer = configured.consumer;
        const producer = configured.producer;
        const configuredServices = this.configuredServices();
        const serviceComponents = this.serviceSlots()
            .map((slot) => configuredServices[slot.id] ?? null)
            .filter((service): service is ConfiguredComponent => !!service);

        if (!consumer || !producer) {
            return null;
        }

        const components: FlowComponentDto[] = [
            {
                role: 'consumer',
                componentId: consumer.component.id,
                position: 0,
                configuration: consumer.configuration,
            },
        ];

        for (const [index, service] of serviceComponents.entries()) {
            components.push({
                role: 'service',
                componentId: service.component.id,
                position: index + 1,
                configuration: service.configuration,
            });
        }

        components.push({
            role: 'producer',
            componentId: producer.component.id,
            position: components.length,
            configuration: producer.configuration,
        });

        return {
            name: this.flowForm.controls.name.value.trim(),
            components,
        };
    }

    private initialComponentFor(
        role: FlowComponentRole,
    ): FlowComponentDto | undefined {
        return this.editingFlow?.components
            .find((component) => component.role === role);
    }

    private async loadComponentDefinitions(): Promise<void> {
        try {
            await Promise.all([
                this.componentDefinitionFacade.loadByRole('consumer'),
                this.componentDefinitionFacade.loadByRole('service'),
                this.componentDefinitionFacade.loadByRole('producer'),
            ]);
        } catch (error) {
            console.error(
                'Error loading component definitions',
                error,
            );
        }
    }
}