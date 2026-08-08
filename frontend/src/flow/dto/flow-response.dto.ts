import { FlowComponentDto } from './flow-component.dto';

export interface FlowResponseDto {
    id: number;
    name: string;
    createdAt: string;
    updatedAt: string;
    components: FlowComponentDto[];
}