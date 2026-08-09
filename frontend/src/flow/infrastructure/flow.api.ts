import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FlowResponseDto } from '../dto/flow-response.dto';
import { FlowDto } from '../dto/flow.dto';



@Injectable({
    providedIn: 'root',
})
export class FlowApiService {
    private readonly http = inject(HttpClient);

    private readonly baseUrl = 'http://localhost:3000/flow';

    getAll(): Observable<FlowResponseDto[]> {
        return this.http.get<FlowResponseDto[]>(this.baseUrl);
    }

    getOne(id: number): Observable<FlowResponseDto> {
        return this.http.get<FlowResponseDto>(`${this.baseUrl}/${id}`);
    }

    create(dto: FlowDto): Observable<FlowResponseDto> {
        return this.http.post<FlowResponseDto>(this.baseUrl, dto);
    }

    update(id: number, dto: FlowDto): Observable<FlowResponseDto> {
        return this.http.put<FlowResponseDto>(
            `${this.baseUrl}/${id}`,
            dto,
        );
    }

    remove(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`);
    }
}

