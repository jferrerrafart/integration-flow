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

    readonly definitionCache =
        signal<Record<string, ComponentDefinitionConfigurationDto>>({});

    getByRole(
        role: FlowComponentRole,
    ): Observable<ComponentDefinitionDto[]> {
        return this.service.getByRole(role);
    }

    getDefinition(
        role: FlowComponentRole,
        type: string,
    ): Observable<ComponentDefinitionConfigurationDto> {
        return this.service.getDefinition(role, type);
    }

    getComponentsByRole(
        role: FlowComponentRole,
    ): ComponentDefinitionDto[] {
        return this.componentsByRole()[role];
    }

    getCachedDefinition(
        role: FlowComponentRole,
        type: string,
    ): ComponentDefinitionConfigurationDto | null {
        return this.definitionCache()[this.definitionKey(role, type)]
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
                this.getByRole(role),
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

    async loadDefinition(
        role: FlowComponentRole,
        type: string,
    ): Promise<ComponentDefinitionConfigurationDto> {
        const key = this.definitionKey(role, type);
        const cached = this.definitionCache()[key];

        if (cached) {
            return cached;
        }

        const definition = await firstValueFrom(
            this.getDefinition(role, type),
        );

        this.definitionCache.update((state) => ({
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