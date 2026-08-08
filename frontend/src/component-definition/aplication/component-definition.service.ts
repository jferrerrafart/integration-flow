import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';



import { ComponentDefinitionApiService } from '../infrastructure/component-definition.api';
import { FlowComponentRole } from '../../shared/types/flow-component-role';
import { ComponentDefinitionDto } from '../dto/component-definition-dto';

@Injectable({
    providedIn: 'root',
})
export class ComponentDefinitionService {
    private readonly api = inject(ComponentDefinitionApiService);

    getConsumers(): Observable<ComponentDefinitionDto[]> {
        return this.api.getAll('consumer');
    }

    getServices(): Observable<ComponentDefinitionDto[]> {
        return this.api.getAll('service');
    }

    getProducers(): Observable<ComponentDefinitionDto[]> {
        return this.api.getAll('producer');
    }

    getDefinition(
        role: FlowComponentRole,
        type: string,
    ): Observable<ComponentDefinitionDto> {
        return this.api.getDefinition(role, type);
    }
}