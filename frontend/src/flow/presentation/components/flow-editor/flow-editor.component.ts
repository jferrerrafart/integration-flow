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
import { MatSnackBar } from '@angular/material/snack-bar';
import { FlowComponentConfiguratorComponent } from '../flow-component-configurator/flow-component-configurator.component';

import { ComponentDefinitionFacade } from '../../../../component-definition/aplication/component-definition.facade';
import { FlowFacade } from '../../../aplication/flow.facade';
import { FlowEditorService, ConfiguredComponent, FlowEditorState, ServiceSlot } from '../../../aplication/flow-editor.service';
import { FlowResponseDto } from '../../../dto/flow-response.dto';
import { FlowComponentRole } from '../../../../shared/types/flow-component-role';
import { getHttpErrorMessage } from '../../../../shared/utils/http-error.util';

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
    private readonly flowEditorService = inject(FlowEditorService);
    private readonly dialogRef =
        inject(MatDialogRef<FlowEditorComponent>);
    private readonly snackBar = inject(MatSnackBar);
    private readonly dialogData =
        inject<FlowEditorDialogData>(MAT_DIALOG_DATA, {
            optional: true,
        });

    readonly consumers = computed(() =>
        this.componentDefinitionFacade.getLoadedComponentListByRole('consumer'));
    readonly services = computed(() =>
        this.componentDefinitionFacade.getLoadedComponentListByRole('service'));
    readonly producers = computed(() =>
        this.componentDefinitionFacade.getLoadedComponentListByRole('producer'));

    readonly loading = signal(false);

    readonly flowForm = new FormGroup({
        name: new FormControl('', {
            nonNullable: true,
            validators: [Validators.required],
        }),
    });

    readonly state = signal<FlowEditorState>({
        consumer: null,
        services: [],
        producer: null,
    });

    readonly serviceSlots = computed(() => this.state().services);
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

            const initialState = this.flowEditorService.buildInitialState(
                this.editingFlow,
                this.nextServiceSlotId,
            );

            if (initialState.services.length > 0) {
                this.nextServiceSlotId += initialState.services.length;
                this.state.set(initialState);
                return;
            }
        }

        this.addServiceSlot();
    }

    onComponentConfigured(
        role: FlowComponentRole,
        configuredComponent: ConfiguredComponent,
    ): void {
        this.state.update((state) => ({
            ...state,
            [role]: configuredComponent,
        }));
    }

    onServiceConfigured(
        slotId: number,
        configuredComponent: ConfiguredComponent,
    ): void {
        this.state.update((state) => ({
            ...state,
            services: state.services.map((slot) => (
                slot.id === slotId
                    ? { ...slot, configured: configuredComponent }
                    : slot
            )),
        }));
    }

    addServiceSlot(): void {
        const slot = this.flowEditorService.createServiceSlot(
            this.nextServiceSlotId++,
        );

        this.state.update((state) => ({
            ...state,
            services: [
                ...state.services,
                slot,
            ],
        }));
    }

    removeServiceSlot(slotId: number): void {
        this.state.update((state) => ({
            ...state,
            services: state.services.filter((slot) => slot.id !== slotId),
        }));
    }

    trackByServiceSlotId(_: number, slot: ServiceSlot): number {
        return slot.id;
    }

    initialConfiguredFor(
        role: FlowComponentRole,
    ): ConfiguredComponent | null {
        const component = this.initialComponentFor(role);

        if (!component) {
            return null;
        }

        return {
            componentId: component.componentId,
            configuration: component.configuration,
        };
    }

    async createFlow(): Promise<void> {
        if (this.flowForm.invalid) {
            this.flowForm.markAllAsTouched();
            this.showMessage('Flow name is required.');
            return;
        }

        const { payload, errorMessage } = this.flowEditorService.buildPayload(
            this.flowForm.controls.name.value,
            this.state(),
        );

        if (!payload) {
            this.showMessage(errorMessage);
            return;
        }

        this.loading.set(true);

        try {
            if (this.editingFlow) {
                await this.flowFacade.update(this.editingFlow.id, payload);
            } else {
                await this.flowFacade.create(payload);
            }

            this.showMessage(
                this.editingFlow
                    ? 'Flow updated successfully.'
                    : 'Flow created successfully.',
            );
            this.dialogRef.close(true);
        } catch (error: unknown) {
            this.showMessage(
                getHttpErrorMessage(
                    error,
                    'Unable to save flow. Check the data and retry.',
                ),
            );
        } finally {
            this.loading.set(false);
        }
    }

    private initialComponentFor(
        role: FlowComponentRole,
    ) {
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

    private showMessage(message: string | null): void {
        if (!message) {
            return;
        }

        this.snackBar.open(message, 'Close', {
            duration: 5000,
        });
    }
}