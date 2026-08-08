import { FlowComponentRole } from '../../shared/enums/flow-component-role.enum';
export class FlowComponentDto {
    role!: FlowComponentRole;

    componentId!: string;

    position!: number;

    configuration!: Record<string, unknown>;
}