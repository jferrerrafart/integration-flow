import { Injectable, inject, signal } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';

import { ComponentDefinitionService } from './component-definition.service';
import { FlowComponentRole } from '../../shared/types/flow-component-role';
import { ComponentDefinitionDto } from '../dto/component-definition.dto';
import { ConfigurationDefinitionDto } from '../dto/configuration-definition.dto';

@Injectable({
    providedIn: 'root',
})
export class ComponentDefinitionFacade {
    private readonly service = inject(ComponentDefinitionService);

    readonly componentsByRole =
        signal<Record<FlowComponentRole, ComponentDefinitionDto[]>>({
            consumer: [],
            service: [],
            producer: [],
        });

    readonly loadingByRole =
        signal<Record<FlowComponentRole, boolean>>({
            consumer: false,
            service: false,
            producer: false,
        });

    readonly configurationDefinitionCache =
        signal<Record<string, ConfigurationDefinitionDto>>({});

    getComponentListByRole(
        role: FlowComponentRole,
    ): Observable<ComponentDefinitionDto[]> {
        return this.service.getComponentListByRole(role);
    }

    getConfigurationDefinition(
        role: FlowComponentRole,
        type: string,
    ): Observable<ConfigurationDefinitionDto> {
        return this.service.getConfigurationDefinition(role, type);
    }

    getLoadedComponentListByRole(
        role: FlowComponentRole,
    ): ComponentDefinitionDto[] {
        return this.componentsByRole()[role];
    }

    getCachedConfigurationDefinition(
        role: FlowComponentRole,
        type: string,
    ): ConfigurationDefinitionDto | null {
        return this.configurationDefinitionCache()[this.definitionKey(role, type)]
            ?? null;
    }

    async loadByRole(
        role: FlowComponentRole,
    ): Promise<void> {
        this.loadingByRole.update((state) => ({
            ...state,
            [role]: true,
        }));

        try {
            const components = await firstValueFrom(
                this.getComponentListByRole(role),
            );

            this.componentsByRole.update((state) => ({
                ...state,
                [role]: components,
            }));
        } finally {
            this.loadingByRole.update((state) => ({
                ...state,
                [role]: false,
            }));
        }
    }

    async loadConfigurationDefinition(
        role: FlowComponentRole,
        type: string,
    ): Promise<ConfigurationDefinitionDto> {
        const key = this.definitionKey(role, type);
        const cached = this.configurationDefinitionCache()[key];

        if (cached) {
            return cached;
        }

        const definition = await firstValueFrom(
            this.getConfigurationDefinition(role, type),
        );

        this.configurationDefinitionCache.update((state) => ({
            ...state,
            [key]: definition,
        }));

        return definition;
    }

    private definitionKey(
        role: FlowComponentRole,
        type: string,
    ): string {
        return `${role}:${type}`;
    }
}