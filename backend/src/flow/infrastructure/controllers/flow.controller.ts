import { Body, Controller, Delete, Get, Param, Post, Put, } from '@nestjs/common';
import { FlowFacade } from 'src/flow/application/flow.facade';
import { FlowDto } from 'src/flow/dto/flow.dto';
import { ParseIntPipe } from '@nestjs/common';
import { FlowResponseDto } from 'src/flow/dto/flow-response.dto';


@Controller('flow')
export class FlowController {
    constructor(
        private readonly flowFacade: FlowFacade,
    ) { }

    @Post()
    create(@Body() dto: FlowDto): Promise<FlowResponseDto> {
        return this.flowFacade.create(dto);
    }

    @Get()
    findAll(): Promise<FlowResponseDto[]> {
        return this.flowFacade.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number): Promise<FlowResponseDto> {
        return this.flowFacade.findOne(id);
    }

    @Put(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: FlowDto,
    ): Promise<FlowResponseDto> {
        return this.flowFacade.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return this.flowFacade.remove(id);
    }
}