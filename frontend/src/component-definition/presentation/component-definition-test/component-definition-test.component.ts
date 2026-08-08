import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { ComponentDefinitionFacade } from '../../aplication/component-definition.facade';
import { ComponentDefinition } from '../../domain/models/component-definition';


@Component({
    selector: 'app-component-definition-test',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Eager,
    template: `
    <h2>Consumers</h2>

    @for (consumer of consumers; track consumer.id) {
      <div>
        {{ consumer.name }}
        - {{ consumer.type }}
        - available: {{ consumer.available }}
      </div>
    }
  `,
})
export class ComponentDefinitionTestComponent {
    private readonly facade = inject(ComponentDefinitionFacade);

    consumers: ComponentDefinition[] = [];

    ngOnInit(): void {
        this.facade.getConsumers().subscribe({
            next: (consumers) => {
                this.consumers = consumers;
            },
            error: (error) => {
                console.error('Error loading consumers', error);
            },
        });
    }
}