import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';



import { ComponentDefinitionService } from './component-definition.service';
import { FlowComponentRole } from '../../shared/types/flow-component-role';
import { ComponentDefinitionDto } from '../dto/component-definition.dto';
import { ComponentDefinitionConfigurationDto } from '../dto/component-definition-configuration.dto';

@Injectable({
    providedIn: 'root',
})
export class ComponentDefinitionFacade {
    private readonly service = inject(ComponentDefinitionService);

    getByRole(
        role: FlowComponentRole,
    ): Observable<ComponentDefinitionDto[]> {
        return this.service.getByRole(role);
    }

    getDefinition(
        role: FlowComponentRole,
        type: string,
    ): Observable<ComponentDefinitionConfigurationDto> {
        return this.service.getDefinition(role, type);
    }
}