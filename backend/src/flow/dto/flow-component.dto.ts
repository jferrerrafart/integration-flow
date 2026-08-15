import {
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsObject,
    IsString,
    Min,
} from 'class-validator';

import { FlowComponentRole } from '../../shared/enums/flow-component-role.enum';

export class FlowComponentDto {
    @IsEnum(FlowComponentRole)
    role!: FlowComponentRole;

    @IsString()
    @IsNotEmpty()
    componentId!: string;

    @IsInt()
    @Min(0)
    position!: number;

    @IsObject()
    configuration!: Record<string, unknown>;
}