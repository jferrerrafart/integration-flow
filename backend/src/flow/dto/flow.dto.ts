import {
    ArrayMinSize,
    IsArray,
    IsNotEmpty,
    IsString,
    MaxLength,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import { FlowComponentDto } from './flow-component.dto';

export class FlowDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name!: string;

    @IsArray()
    @ArrayMinSize(2)
    @ValidateNested({ each: true })
    @Type(() => FlowComponentDto)
    components!: FlowComponentDto[];
}