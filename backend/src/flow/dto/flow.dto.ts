import { FlowComponentDto } from './flow-component.dto';

export class FlowDto {
    name!: string;

    components!: FlowComponentDto[];
}