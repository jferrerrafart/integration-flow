import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { FlowService } from './flow.service';
import { FlowDto } from '../dto/flow.dto';
import { FlowResponseDto } from '../dto/flow-response.dto';

@Injectable({
    providedIn: 'root',
})
export class FlowFacade {
    private readonly service = inject(FlowService);

    getAll(): Observable<FlowResponseDto[]> {
        return this.service.getAll();
    }

    getOne(id: number): Observable<FlowResponseDto> {
        return this.service.getOne(id);
    }

    create(dto: FlowDto): Observable<FlowResponseDto> {
        return this.service.create(dto);
    }

    update(id: number, dto: FlowDto): Observable<FlowResponseDto> {
        return this.service.update(id, dto);
    }

    remove(id: number): Observable<void> {
        return this.service.remove(id);
    }
}
