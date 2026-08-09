import { Component, effect, inject, input, output, signal } from '@angular/core';

import { ComponentSelectorComponent } from '../component-selector/component-selector.component';
import { DynamicConfigurationComponent } from '../dynamic-cofiguration/dynamic-configuration.component';

import { ComponentDefinitionDto } from '../../../../component-definition/dto/component-definition.dto';
import { ComponentDefinitionConfigurationDto } from '../../../../component-definition/dto/component-definition-configuration.dto';
import { ComponentDefinitionFacade } from '../../../../component-definition/aplication/component-definition.facade';
import { FlowComponentRole } from '../../../../shared/types/flow-component-role';

@Component({
    selector: 'app-flow-component-configurator',
    standalone: true,
    imports: [
        ComponentSelectorComponent,
        DynamicConfigurationComponent,
    ],
    templateUrl: './flow-component-configurator.component.html',
    styleUrl: './flow-component-configurator.component.scss',
})
export class FlowComponentConfiguratorComponent {
    readonly role = input.required<FlowComponentRole>();

    readonly components = input.required<ComponentDefinitionDto[]>();

    readonly componentSelected = output<ComponentDefinitionDto>();

    readonly componentConfigured = output<{
        component: ComponentDefinitionDto;
        configuration: Record<string, unknown>;
    }>();

    readonly initialComponentId = input<string | null>(null);

    readonly initialConfiguration =
        input<Record<string, unknown> | null>(null);

    private readonly facade = inject(ComponentDefinitionFacade);

    readonly selectedComponent = signal<ComponentDefinitionDto | null>(null);

    readonly configuration =
        signal<ComponentDefinitionConfigurationDto | null>(null);

    readonly initialFormValue =
        signal<Record<string, unknown> | null>(null);

    readonly configurationValue =
        signal<Record<string, unknown> | null>(null);

    constructor() {
        effect(() => {
            const initialComponentId = this.initialComponentId();
            const components = this.components();
            const selected = this.selectedComponent();

            if (!initialComponentId || selected) {
                return;
            }

            const initialComponent = components.find(
                (component) => component.id === initialComponentId,
            );

            if (initialComponent) {
                void this.onComponentSelected(initialComponent);
            }
        });
    }

    async onComponentSelected(
        component: ComponentDefinitionDto,
    ): Promise<void> {
        this.selectedComponent.set(component);
        this.configuration.set(null);

        try {
            const configuration = await this.facade.loadDefinition(
                this.role(),
                component.type,
            );

            this.configuration.set(configuration);

            const initialConfiguration =
                this.initialConfiguration();
            this.initialFormValue.set(initialConfiguration);
            this.configurationValue.set(initialConfiguration);

            this.componentConfigured.emit({
                component,
                configuration:
                    initialConfiguration ?? {},
            });
        } catch (error) {
            console.error(
                'Error loading component configuration',
                error,
            );
        }

        this.componentSelected.emit(component);
    }

    onConfigurationChanged(
        configuration: Record<string, unknown>,
    ): void {
        this.configurationValue.set(configuration);

        const selectedComponent = this.selectedComponent();

        if (!selectedComponent) {
            return;
        }

        this.componentConfigured.emit({
            component: selectedComponent,
            configuration,
        });
    }
}