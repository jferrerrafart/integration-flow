import { Injectable, inject, signal } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';

import { ComponentDefinitionService } from './component-definition.service';
import { FlowComponentRole } from '../../shared/types/flow-component-role';
import { ComponentDefinitionDto } from '../dto/component-definition.dto';
import { ComponentDefinitionConfigurationDto } from '../dto/component-definition-configuration.dto';

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
        signal<Record<string, ComponentDefinitionConfigurationDto>>({});

    getComponentListByRole(
        role: FlowComponentRole,
    ): Observable<ComponentDefinitionDto[]> {
        return this.service.getComponentListByRole(role);
    }

    getConfigurationDefinition(
        role: FlowComponentRole,
        type: string,
    ): Observable<ComponentDefinitionConfigurationDto> {
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
    ): ComponentDefinitionConfigurationDto | null {
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
    ): Promise<ComponentDefinitionConfigurationDto> {
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