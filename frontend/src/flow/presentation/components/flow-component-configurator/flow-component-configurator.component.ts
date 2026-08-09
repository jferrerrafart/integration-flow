import { Component, inject, input, output, signal } from '@angular/core';

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

    private readonly facade = inject(ComponentDefinitionFacade);

    readonly selectedComponent = signal<ComponentDefinitionDto | null>(null);

    readonly configuration =
        signal<ComponentDefinitionConfigurationDto | null>(null);

    onComponentSelected(component: ComponentDefinitionDto): void {
        this.selectedComponent.set(component);
        this.configuration.set(null);
        console.log('Selected:', component);

        this.facade.getDefinition(
            this.role(),
            component.type,
        ).subscribe({
            next: (configuration) => {
                console.log('Configuration:', configuration);
                this.configuration.set(configuration);
            },
            error: (error) => {
                console.error(
                    'Error loading component configuration',
                    error,
                );
            },
        });

        this.componentSelected.emit(component);
    }
}