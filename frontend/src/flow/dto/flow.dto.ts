import { FlowComponentDto } from './flow-component.dto';

export interface FlowDto {
    name: string;
    components: FlowComponentDto[];
}