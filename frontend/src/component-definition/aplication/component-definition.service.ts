import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';


import {
    ComponentDefinition,
    ComponentRole,
} from '../domain/models/component-definition';
import { ComponentDefinitionApiService } from '../infrastructure/component-definition.api';

@Injectable({
    providedIn: 'root',
})
export class ComponentDefinitionService {
    private readonly api = inject(ComponentDefinitionApiService);

    getConsumers(): Observable<ComponentDefinition[]> {
        return this.api.getAll('consumer');
    }

    getServices(): Observable<ComponentDefinition[]> {
        return this.api.getAll('service');
    }

    getProducers(): Observable<ComponentDefinition[]> {
        return this.api.getAll('producer');
    }

    getDefinition(
        role: ComponentRole,
        type: string,
    ): Observable<ComponentDefinition> {
        return this.api.getDefinition(role, type);
    }
}