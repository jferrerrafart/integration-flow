import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FlowComponentRole } from '../../shared/types/flow-component-role';
import { ComponentDefinitionDto } from '../dto/component-definition.dto';
import { ConfigurationDefinitionDto } from '../dto/configuration-definition.dto';


@Injectable({
    providedIn: 'root',
})
export class ComponentDefinitionApiService {
    private readonly http = inject(HttpClient);

    private readonly baseUrl = 'http://localhost:3000/component-definitions';

    getComponentListByRole(
        role: FlowComponentRole,
    ): Observable<ComponentDefinitionDto[]> {
        return this.http.get<ComponentDefinitionDto[]>(
            `${this.baseUrl}/${role}`,
        );
    }

    getConfigurationDefinition(
        role: FlowComponentRole,
        type: string,
    ): Observable<ConfigurationDefinitionDto> {
        return this.http.get<ConfigurationDefinitionDto>(
            `${this.baseUrl}/${role}/${type}`,
        );
    }
}