import { Component, effect, inject, input, output, signal } from '@angular/core';

import { ComponentSelectorComponent } from '../component-selector/component-selector.component';
import { DynamicConfigurationComponent } from '../dynamic-cofiguration/dynamic-configuration.component';

import { ComponentDefinitionDto } from '../../../../component-definition/dto/component-definition.dto';
import { ConfigurationDefinitionDto } from '../../../../component-definition/dto/configuration-definition.dto';
import { ComponentDefinitionFacade } from '../../../../component-definition/aplication/component-definition.facade';
import { ConfiguredComponent } from '../../../aplication/flow-editor.service';
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
        componentId: string;
        configuration: Record<string, unknown>;
    }>();

    readonly initialConfigured =
        input<ConfiguredComponent | null>(null);

    readonly markTouched = input<number>(0);

    readonly configurationValidChange = output<boolean>();

    private readonly facade = inject(ComponentDefinitionFacade);

    readonly selectedComponent = signal<ComponentDefinitionDto | null>(null);

    readonly configuration =
        signal<ConfigurationDefinitionDto | null>(null);

    readonly initialFormValue =
        signal<Record<string, unknown> | null>(null);

    readonly configurationValue =
        signal<Record<string, unknown> | null>(null);

    // No component selected yet means nothing to validate here; missing
    // selection is reported separately when building the flow payload.
    readonly configurationValid = signal(true);

    constructor() {
        effect(() => {
            const initialConfigured = this.initialConfigured();
            const components = this.components();
            const selected = this.selectedComponent();

            if (!initialConfigured || selected) {
                return;
            }

            const initialComponent = components.find(
                (component) => component.id === initialConfigured.componentId,
            );

            if (initialComponent) {
                void this.onComponentSelected(
                    initialComponent,
                    initialConfigured.configuration,
                );
            }
        });
    }

    async onComponentSelected(
        component: ComponentDefinitionDto,
        initialConfiguration: Record<string, unknown> | null = null,
    ): Promise<void> {
        this.selectedComponent.set(component);
        this.configuration.set(null);
        this.onConfigurationValidChanged(false);

        try {
            const configuration = await this.facade.loadConfigurationDefinition(
                this.role(),
                component.type,
            );

            this.configuration.set(configuration);
            this.initialFormValue.set(initialConfiguration);
            this.configurationValue.set(initialConfiguration);

            this.componentConfigured.emit({
                componentId: component.id,
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
            componentId: selectedComponent.id,
            configuration,
        });
    }

    onConfigurationValidChanged(valid: boolean): void {
        this.configurationValid.set(valid);
        this.configurationValidChange.emit(valid);
    }
}