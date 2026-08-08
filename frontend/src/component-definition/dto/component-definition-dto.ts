import { FlowComponentRole } from "../../shared/types/flow-component-role";



export interface ComponentDefinitionDto {
    id: string;
    name: string;
    description: string;
    type: string;
    role: FlowComponentRole;
    available: boolean;
}