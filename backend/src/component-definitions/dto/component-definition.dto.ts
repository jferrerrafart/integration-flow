import { FlowComponentRole } from "src/shared/enums/flow-component-role.enum";

export class ComponentDefinitionDto {
    id!: string;
    type!: string;
    name!: string;
    description!: string;
    role!: FlowComponentRole;
    available!: boolean;
}
