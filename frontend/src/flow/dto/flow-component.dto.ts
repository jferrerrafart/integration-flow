import { FlowComponentRole } from "../../shared/types/flow-component-role";


export interface FlowComponentDto {
    role: FlowComponentRole;
    componentId: string;
    position: number;
    configuration: Record<string, unknown>;
}