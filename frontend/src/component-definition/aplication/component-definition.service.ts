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

    getComponentListByRole(
        role: FlowComponentRole,
    ): Observable<ComponentDefinitionDto[]> {
        return this.api.getComponentListByRole(role);
    }

    getConfigurationDefinition(
        role: FlowComponentRole,
        type: string,
    ): Observable<ComponentDefinitionConfigurationDto> {
        return this.api.getConfigurationDefinition(role, type);
    }
}