import { FlowComponentDto } from './flow-component.dto';

export class FlowResponseDto {
    id!: number;

    name!: string;

    createdAt!: Date;

    updatedAt!: Date;

    components!: FlowComponentDto[];
}