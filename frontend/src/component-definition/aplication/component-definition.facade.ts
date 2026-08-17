import { Injectable, inject, signal } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';

import { ComponentDefinitionService } from './component-definition.service';
import { FlowComponentRole } from '../../shared/types/flow-component-role';
import { ComponentDefinitionDto } from '../dto/component-definition.dto';
import { ConfigurationDefinitionDto } from '../dto/configuration-definition.dto';

@Injectable({
    providedIn: 'root',
})
export class ComponentDefinitionFacade {
    private readonly service = inject(ComponentDefinitionService);


    async loadComponentListByRole(
        role: FlowComponentRole,
    ): Promise<ComponentDefinitionDto[]> {
        return firstValueFrom(
            this.service.getComponentListByRole(role),
        );
    }

    async loadConfigurationDefinition(
        role: FlowComponentRole,
        type: string,
    ): Promise<ConfigurationDefinitionDto> {
        return firstValueFrom(
            this.service.getConfigurationDefinition(role, type),
        );
    }
}