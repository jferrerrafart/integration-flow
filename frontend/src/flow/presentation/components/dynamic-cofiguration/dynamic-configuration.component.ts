import { Component, computed, input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { ComponentDefinitionConfigurationDto } from '../../../../component-definition/dto/component-definition-configuration.dto';
import { DynamicField } from './dynamic-field/dynamic-field.model';

@Component({
    selector: 'app-dynamic-configuration',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
    ],
    templateUrl: './dynamic-configuration.component.html',
    styleUrl: './dynamic-configuration.component.scss',
})
export class DynamicConfigurationComponent {
    readonly configuration =
        input.required<ComponentDefinitionConfigurationDto>();

    readonly fields = computed<DynamicField[]>(() => {
        const definition = this.configuration().definition;

        return Object.entries(definition)
            .map(([name, value]) => this.mapField(name, value))
            .sort((a, b) => a.order - b.order);
    });

    readonly form = computed(() => {
        const group: Record<string, FormControl> = {};

        for (const field of this.fields()) {
            group[field.name] = new FormControl(
                field.defaultValue ?? null,
                field.use === 'required'
                    ? Validators.required
                    : [],
            );
        }

        return new FormGroup(group);
    });

    private mapField(name: string, value: unknown): DynamicField {
        const field = value as Record<string, unknown>;
        const appinfo =
            field['appinfo'] as Record<string, unknown> | undefined;

        return {
            name,
            type: String(field['type'] ?? ''),
            use: field['use'] === 'required'
                ? 'required'
                : 'optional',
            description:
                typeof field['description'] === 'string'
                    ? field['description']
                    : undefined,
            order:
                typeof field['order'] === 'number'
                    ? field['order']
                    : 0,
            defaultValue:
                typeof field['defaultValue'] === 'string'
                    ? field['defaultValue']
                    : undefined,
            appinfo: appinfo
                ? {
                    fieldType:
                        typeof appinfo['fieldType'] === 'string'
                            ? appinfo['fieldType']
                            : undefined,
                    label:
                        typeof appinfo['label'] === 'string'
                            ? appinfo['label']
                            : undefined,
                    dynamic:
                        typeof appinfo['dynamic'] === 'boolean'
                            ? appinfo['dynamic']
                            : undefined,
                    advanced:
                        typeof appinfo['advanced'] === 'boolean'
                            ? appinfo['advanced']
                            : undefined,
                }
                : undefined,
            enumeration:
                Array.isArray(field['enumeration'])
                    ? field['enumeration'] as Array<{ value: string }>
                    : undefined,
        };
    }
}