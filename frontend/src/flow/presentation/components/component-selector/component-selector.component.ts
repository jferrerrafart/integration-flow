import { Component, input, output, signal } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

import { ComponentDefinitionDto } from '../../../../component-definition/dto/component-definition.dto';

@Component({
    selector: 'app-component-selector',
    standalone: true,
    imports: [
        MatFormFieldModule,
        MatSelectModule,
    ],
    templateUrl: './component-selector.component.html',
    styleUrl: './component-selector.component.scss',
})
export class ComponentSelectorComponent {
    readonly label = input.required<string>();

    readonly components = input.required<ComponentDefinitionDto[]>();

    readonly selectedComponent = signal<ComponentDefinitionDto | null>(null);

    readonly componentSelected = output<ComponentDefinitionDto>();

    onComponentSelected(component: ComponentDefinitionDto): void {
        this.selectedComponent.set(component);
        this.componentSelected.emit(component);
    }
}