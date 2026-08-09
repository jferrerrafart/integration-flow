import {
    Component,
    computed,
    effect,
    input,
    output,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import {
    AbstractControl,
    FormArray,
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { switchMap } from 'rxjs';
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

    readonly initialValue = input<Record<string, unknown> | null>(null);

    readonly valueChanged = output<Record<string, unknown>>();

    readonly fields = computed<DynamicField[]>(() => {
        const definition = this.configuration().definition;

        return Object.entries(definition)
            .map(([name, value]) => this.mapField(name, value))
            .sort((a, b) => a.order - b.order);
    });

    readonly form = computed(() => {
        const group: Record<string, AbstractControl> = {};

        for (const field of this.fields()) {
            if (field.sequence) {
                group[field.name] = this.createSequenceArray(field);
                continue;
            }

            group[field.name] = this.createScalarControl(field);
        }

        return new FormGroup(group);
    });

    private readonly formChanges = toSignal(
        toObservable(this.form).pipe(
            switchMap((form) => form.valueChanges),
        ),
        {
            requireSync: false,
        },
    );

    constructor() {
        effect(() => {
            const form = this.form();
            const initialValue = this.initialValue();

            if (initialValue) {
                form.patchValue(initialValue, {
                    emitEvent: false,
                });
            }

            this.valueChanged.emit(
                form.getRawValue() as Record<string, unknown>,
            );
        });

        effect(() => {
            const value = this.formChanges();

            if (!value) {
                return;
            }

            this.valueChanged.emit(value);
        });
    }

    addSequenceItem(field: DynamicField): void {
        if (!field.sequence || !this.canAddSequenceItem(field)) {
            return;
        }

        this.getSequenceArray(field).push(
            this.createSequenceItemGroup(field),
        );
    }

    removeSequenceItem(
        field: DynamicField,
        index: number,
    ): void {
        if (!field.sequence || !this.canRemoveSequenceItem(field)) {
            return;
        }

        this.getSequenceArray(field).removeAt(index);
    }

    getSequenceControls(field: DynamicField): FormGroup[] {
        if (!field.sequence) {
            return [];
        }

        return this.getSequenceArray(field)
            .controls as FormGroup[];
    }

    canAddSequenceItem(field: DynamicField): boolean {
        if (!field.sequence) {
            return false;
        }

        if (field.maxItems === undefined) {
            return true;
        }

        return this.getSequenceArray(field).length < field.maxItems;
    }

    canRemoveSequenceItem(field: DynamicField): boolean {
        if (!field.sequence) {
            return false;
        }

        const minItems = field.minItems ?? 0;

        return this.getSequenceArray(field).length > minItems;
    }

    isBooleanField(field: DynamicField): boolean {
        return (field.appinfo?.fieldType ?? field.type) === 'boolean';
    }

    isSelectField(field: DynamicField): boolean {
        const kind = field.appinfo?.fieldType ?? field.type;

        return kind === 'enumeration'
            || kind === 'textenumeration';
    }

    getFieldLabel(field: DynamicField): string {
        return field.appinfo?.label || field.name;
    }

    trackByFieldName(_: number, field: DynamicField): string {
        return field.name;
    }

    private mapField(name: string, value: unknown): DynamicField {
        const field = value as Record<string, unknown>;
        const appinfo =
            field['appinfo'] as Record<string, unknown> | undefined;
        const sequence = appinfo?.['sequence'] === true;
        const sequenceTemplateFields =
            this.mapSequenceTemplate(appinfo);

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
            defaultValue: this.resolveDefaultValue(field, appinfo),
            sequence,
            minItems: this.parseMinItems(appinfo),
            maxItems: this.parseMaxItems(appinfo),
            sequenceTemplateFields,
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
                Array.isArray(appinfo?.['enumeration'])
                    ? appinfo['enumeration'] as Array<{ value: string }>
                    : Array.isArray(field['enumeration'])
                        ? field['enumeration'] as Array<{ value: string }>
                        : undefined,
        };
    }

    private createScalarControl(
        field: DynamicField,
    ): FormControl {
        return new FormControl(
            field.defaultValue ?? null,
            field.use === 'required'
                ? Validators.required
                : [],
        );
    }

    private createSequenceArray(
        field: DynamicField,
    ): FormArray<FormGroup> {
        const items: FormGroup[] = [];
        const minItems = field.minItems ?? 0;

        for (let index = 0; index < minItems; index += 1) {
            items.push(this.createSequenceItemGroup(field));
        }

        return new FormArray(items);
    }

    private createSequenceItemGroup(
        field: DynamicField,
    ): FormGroup {
        const templateFields =
            field.sequenceTemplateFields ?? [];
        const controls: Record<string, AbstractControl> = {};

        if (templateFields.length === 0) {
            controls['value'] = new FormControl('');
            return new FormGroup(controls);
        }

        for (const templateField of templateFields) {
            controls[templateField.name] =
                this.createScalarControl(templateField);
        }

        return new FormGroup(controls);
    }

    private getSequenceArray(
        field: DynamicField,
    ): FormArray<FormGroup> {
        return this.form().get(field.name) as FormArray<FormGroup>;
    }

    private parseMinItems(
        appinfo?: Record<string, unknown>,
    ): number {
        const rawMin = appinfo?.['min'];

        if (typeof rawMin !== 'string') {
            return 0;
        }

        const parsed = Number(rawMin);

        return Number.isFinite(parsed)
            ? parsed
            : 0;
    }

    private parseMaxItems(
        appinfo?: Record<string, unknown>,
    ): number | undefined {
        const rawMax = appinfo?.['max'];

        if (typeof rawMax !== 'string') {
            return undefined;
        }

        if (rawMax === 'unbounded') {
            return undefined;
        }

        const parsed = Number(rawMax);

        return Number.isFinite(parsed)
            ? parsed
            : undefined;
    }

    private mapSequenceTemplate(
        appinfo?: Record<string, unknown>,
    ): DynamicField[] | undefined {
        const rawTemplate = appinfo?.['sequencetemplate'];

        if (!rawTemplate || Array.isArray(rawTemplate)) {
            return undefined;
        }

        if (typeof rawTemplate !== 'object') {
            return undefined;
        }

        const template =
            rawTemplate as Record<string, unknown>;

        return Object.entries(template)
            .map(([name, value]) => this.mapField(name, value))
            .sort((a, b) => a.order - b.order);
    }

    private resolveDefaultValue(
        field: Record<string, unknown>,
        appinfo?: Record<string, unknown>,
    ): string | boolean | undefined {
        const fieldType =
            typeof appinfo?.['fieldType'] === 'string'
                ? appinfo['fieldType']
                : typeof field['type'] === 'string'
                    ? field['type']
                    : undefined;

        const rawDefault =
            field['defaultValue'] ?? appinfo?.['defaultValue'];

        if (fieldType === 'boolean') {
            if (typeof rawDefault === 'boolean') {
                return rawDefault;
            }

            if (typeof rawDefault === 'string') {
                return rawDefault.toLowerCase() === 'true';
            }

            return undefined;
        }

        return typeof rawDefault === 'string'
            ? rawDefault
            : undefined;
    }
}