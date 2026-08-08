import { Injectable } from '@nestjs/common';

import { ComponentDefinitionService } from './component-definitions.service';
import { FlowComponentRole } from 'src/shared/enums/flow-component-role.enum';

@Injectable()
export class ComponentDefinitionFacade {
    constructor(
        private readonly service: ComponentDefinitionService,
    ) { }

    getConsumers() {
        return this.service.getAll(FlowComponentRole.CONSUMER);
    }

    getServices() {
        return this.service.getAll(FlowComponentRole.SERVICE);
    }

    getProducers() {
        return this.service.getAll(FlowComponentRole.PRODUCER);
    }

    getDefinition(
        role: FlowComponentRole,
        type: string,
    ) {
        return this.service.getDefinition(role, type);
    }
}