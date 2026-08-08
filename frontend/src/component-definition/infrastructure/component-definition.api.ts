import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ComponentDefinition, ComponentRole } from '../domain/models/component-definition';


@Injectable({
    providedIn: 'root',
})
export class ComponentDefinitionApiService {
    private readonly http = inject(HttpClient);

    private readonly baseUrl = 'http://localhost:3000/component-definitions';

    getAll(role: ComponentRole): Observable<ComponentDefinition[]> {
        return this.http.get<ComponentDefinition[]>(
            `${this.baseUrl}/${role}s`,
        );
    }

    getDefinition(
        role: ComponentRole,
        type: string,
    ): Observable<ComponentDefinition> {
        return this.http.get<ComponentDefinition>(
            `${this.baseUrl}/${role}/${type}`,
        );
    }
}