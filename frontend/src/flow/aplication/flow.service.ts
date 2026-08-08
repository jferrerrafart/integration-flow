import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { FlowApiService } from '../infrastructure/flow.api';
import { FlowDto } from '../dto/flow.dto';
import { FlowResponseDto } from '../dto/flow-response.dto';

@Injectable({
    providedIn: 'root',
})
export class FlowService {
    private readonly api = inject(FlowApiService);

    getAll(): Observable<FlowResponseDto[]> {
        return this.api.getAll();
    }

    getOne(id: number): Observable<FlowResponseDto> {
        return this.api.getOne(id);
    }

    create(dto: FlowDto): Observable<FlowResponseDto> {
        return this.api.create(dto);
    }

    update(id: number, dto: FlowDto): Observable<FlowResponseDto> {
        return this.api.update(id, dto);
    }

    remove(id: number): Observable<void> {
        return this.api.remove(id);
    }
}
