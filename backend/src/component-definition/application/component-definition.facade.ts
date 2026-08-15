import { Injectable } from '@nestjs/common';

import { ComponentDefinitionService } from './component-definition.service';
import { FlowComponentRole } from 'src/shared/enums/flow-component-role.enum';

@Injectable()
export class ComponentDefinitionFacade {
    constructor(
        private readonly service: ComponentDefinitionService,
    ) { }

    getComponentListByRole(role: FlowComponentRole) {
        return this.service.getComponentListByRole(role);
    }

    getConfigurationDefinition(
        role: FlowComponentRole,
        type: string,
    ) {
        return this.service.getConfigurationDefinition(role, type);
    }
}