import { Body, Controller, Delete, Get, Param, Post, Put, } from '@nestjs/common';
import { FlowFacade } from 'src/flow/application/flow.facade';
import { FlowDto } from 'src/flow/dto/flow.dto';
import { ParseIntPipe } from '@nestjs/common';


@Controller('flow')
export class FlowController {
    constructor(
        private readonly flowFacade: FlowFacade,
    ) { }

    @Post()
    create(@Body() dto: FlowDto) {
        return this.flowFacade.create(dto);
    }

    @Get()
    findAll() {
        return this.flowFacade.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.flowFacade.findOne(id);
    }

    @Put(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: FlowDto,
    ) {
        return this.flowFacade.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.flowFacade.remove(id);
    }
}