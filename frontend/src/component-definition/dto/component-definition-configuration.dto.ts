import { ComponentDefinitionDto } from "./component-definition.dto";


export interface ComponentDefinitionConfigurationDto
    extends ComponentDefinitionDto {
    configuration: Record<string, unknown>;
}