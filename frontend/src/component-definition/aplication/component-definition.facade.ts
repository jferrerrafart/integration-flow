import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';



import { ComponentDefinitionService } from './component-definition.service';
import { FlowComponentRole } from '../../shared/types/flow-component-role';
import { ComponentDefinitionDto } from '../dto/component-definition-dto';

@Injectable({
    providedIn: 'root',
})
export class ComponentDefinitionFacade {
    private readonly service = inject(ComponentDefinitionService);

    getConsumers(): Observable<ComponentDefinitionDto[]> {
        return this.service.getConsumers();
    }

    getServices(): Observable<ComponentDefinitionDto[]> {
        return this.service.getServices();
    }

    getProducers(): Observable<ComponentDefinitionDto[]> {
        return this.service.getProducers();
    }

    getDefinition(
        role: FlowComponentRole,
        type: string,
    ): Observable<ComponentDefinitionDto> {
        return this.service.getDefinition(role, type);
    }
}