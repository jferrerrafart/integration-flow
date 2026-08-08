import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';


import {
    ComponentDefinition,
    ComponentRole,
} from '../domain/models/component-definition';
import { ComponentDefinitionService } from './component-definition.service';

@Injectable({
    providedIn: 'root',
})
export class ComponentDefinitionFacade {
    private readonly service = inject(ComponentDefinitionService);

    getConsumers(): Observable<ComponentDefinition[]> {
        return this.service.getConsumers();
    }

    getServices(): Observable<ComponentDefinition[]> {
        return this.service.getServices();
    }

    getProducers(): Observable<ComponentDefinition[]> {
        return this.service.getProducers();
    }

    getDefinition(
        role: ComponentRole,
        type: string,
    ): Observable<ComponentDefinition> {
        return this.service.getDefinition(role, type);
    }
}