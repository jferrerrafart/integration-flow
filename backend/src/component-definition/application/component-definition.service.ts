import { Injectable, NotFoundException } from '@nestjs/common';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

import { FlowComponentRole } from 'src/shared/enums/flow-component-role.enum';
import { ComponentDefinitionDto } from '../dto/component-definition.dto';
import { ComponentDefinitionConfigurationDto } from '../dto/component-definition-configuration.dto';

@Injectable()
export class ComponentDefinitionService {
    private readonly dataPath = join(
        __dirname,
        '../infrastructure/data',
    );

    private readonly library = require(
        '../infrastructure/data/challenge-library.json',
    );

    getAll(role: FlowComponentRole): ComponentDefinitionDto[] {
        const index = this.getIndex(role);

        return Object.values(index).map((component: any) => ({
            id: component.id,
            name: component.name,
            description: component.description,
            type: component.type,
            role,
            available: this.isAvailable(component.type),
        }));
    }

    getOne(
        role: FlowComponentRole,
        type: string,
    ): ComponentDefinitionDto {
        const index = this.getIndex(role);

        const component: any = Object.values(index).find(
            (item: any) => item.type === type,
        );

        if (!component) {
            throw new NotFoundException(
                `Component not found for type: ${type}`,
            );
        }

        return {
            id: component.id,
            name: component.name,
            description: component.description,
            type: component.type,
            role,
            available: this.isAvailable(component.type),
        };
    }

    getDefinition(
        role: FlowComponentRole,
        type: string,
    ): ComponentDefinitionConfigurationDto {
        const component = this.getOne(role, type);

        if (!component.available) {
            throw new NotFoundException(
                `Definition file not available for type: ${type}`,
            );
        }

        const filePath = this.getDefinitionPath(type);

        return {
            ...component,
            definition: JSON.parse(
                readFileSync(filePath, 'utf-8'),
            ),
        };
    }

    private getIndex(
        role: FlowComponentRole,
    ): Record<string, any> {
        switch (role) {
            case 'consumer':
                return this.library.consumer_index;

            case 'service':
                return this.library.services_index;

            case 'producer':
                return this.library.producer_index;

            default:
                throw new Error(
                    `Unsupported component role: ${role}`,
                );
        }
    }

    private isAvailable(type: string): boolean {
        return existsSync(this.getDefinitionPath(type));
    }

    private getDefinitionPath(type: string): string {
        return join(
            this.dataPath,
            `${type}.json`,
        );
    }
}