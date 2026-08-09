import { ComponentDefinitionDto } from "./component-definition.dto";


export interface ComponentDefinitionConfigurationDto
    extends ComponentDefinitionDto {
    definition: Record<string, unknown>;
}