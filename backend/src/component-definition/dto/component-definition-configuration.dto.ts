import { ComponentDefinitionDto } from './component-definition.dto';

export class ComponentDefinitionConfigurationDto extends ComponentDefinitionDto {
    definition!: Record<string, unknown>;
}