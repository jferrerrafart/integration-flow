import {
    Controller,
    Get,
    Param,
    ParseEnumPipe,
} from '@nestjs/common';
import { ComponentDefinitionFacade } from 'src/component-definition/application/component-definition.facade';
import { FlowComponentRole } from 'src/shared/enums/flow-component-role.enum';

@Controller('component-definitions')
export class ComponentDefinitionController {
    constructor(
        private readonly facade: ComponentDefinitionFacade,
    ) { }

    @Get(':role')
    getComponentListByRole(
        @Param('role', new ParseEnumPipe(FlowComponentRole))
        role: FlowComponentRole,
    ) {
        return this.facade.getComponentListByRole(role);
    }

    @Get(':role/:type')
    getConfigurationDefinition(
        @Param('role', new ParseEnumPipe(FlowComponentRole))
        role: FlowComponentRole,
        @Param('type') type: string,
    ) {
        return this.facade.getConfigurationDefinition(role, type);
    }
}