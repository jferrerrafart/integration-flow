import { ComponentDefinitionDto } from './component-definition.dto';

export class ComponentDefinitionConfigurationDto extends ComponentDefinitionDto {
    configuration!: Record<string, unknown>;
}