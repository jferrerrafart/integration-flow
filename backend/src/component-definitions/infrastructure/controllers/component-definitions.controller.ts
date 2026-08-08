import { Controller, Get, Param } from '@nestjs/common'
import { ComponentDefinitionFacade } from 'src/component-definitions/application/component-definitions.facade';
import { FlowComponentRole } from 'src/shared/enums/flow-component-role.enum';

@Controller('component-definitions')
export class ComponentDefinitionsController {
    constructor(
        private readonly facade: ComponentDefinitionFacade,
    ) { }

    @Get('consumers')
    getConsumers() {
        return this.facade.getConsumers();
    }

    @Get('services')
    getServices() {
        return this.facade.getServices();
    }

    @Get('producers')
    getProducers() {
        return this.facade.getProducers();
    }

    @Get(':role/:type')
    getDefinition(
        @Param('role') role: FlowComponentRole,
        @Param('type') type: string,
    ) {
        return this.facade.getDefinition(role, type);
    }
}