import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';



import { ComponentDefinitionApiService } from '../infrastructure/component-definition.api';
import { FlowComponentRole } from '../../shared/types/flow-component-role';
import { ComponentDefinitionDto } from '../dto/component-definition.dto';
import { ComponentDefinitionConfigurationDto } from '../dto/component-definition-configuration.dto';

@Injectable({
    providedIn: 'root',
})
export class ComponentDefinitionService {
    private readonly api = inject(ComponentDefinitionApiService);

    getByRole(
        role: FlowComponentRole,
    ): Observable<ComponentDefinitionDto[]> {
        return this.api.getAll(role);
    }

    getDefinition(
        role: FlowComponentRole,
        type: string,
    ): Observable<ComponentDefinitionConfigurationDto> {
        return this.api.getDefinition(role, type);
    }
}