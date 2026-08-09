import { Component, inject, OnInit, signal } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { FlowComponentConfiguratorComponent } from '../flow-component-configurator/flow-component-configurator.component';

import { ComponentDefinitionFacade } from '../../../../component-definition/aplication/component-definition.facade';
import { ComponentDefinitionDto } from '../../../../component-definition/dto/component-definition.dto';

@Component({
    selector: 'app-flow-editor',
    standalone: true,
    imports: [
        FlowComponentConfiguratorComponent, MatDialogModule,
    ],
    templateUrl: './flow-editor.component.html',
    styleUrl: './flow-editor.component.scss',
})
export class FlowEditorComponent implements OnInit {
    private readonly componentDefinitionFacade =
        inject(ComponentDefinitionFacade);

    readonly consumers = signal<ComponentDefinitionDto[]>([]);
    readonly services = signal<ComponentDefinitionDto[]>([]);
    readonly producers = signal<ComponentDefinitionDto[]>([]);

    ngOnInit(): void {
        this.componentDefinitionFacade
            .getByRole('consumer')
            .subscribe({
                next: (components) => {
                    this.consumers.set(components);
                },
                error: (error) => {
                    console.error('Error loading consumers', error);
                },
            });

        this.componentDefinitionFacade
            .getByRole('service')
            .subscribe({
                next: (components) => {
                    this.services.set(components);
                },
                error: (error) => {
                    console.error('Error loading services', error);
                },
            });

        this.componentDefinitionFacade
            .getByRole('producer')
            .subscribe({
                next: (components) => {
                    this.producers.set(components);
                },
                error: (error) => {
                    console.error('Error loading producers', error);
                },
            });
    }
    createFlow(): void {
        // TODO: implement flow creation
    }
}