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
    ValidatorFn,
    Validators,
} from '@angular/forms';
import { switchMap } from 'rxjs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { ComponentDefinitionConfigurationDto } from '../../../../component-definition/dto/component-definition-configuration.dto';
import { DynamicField } from './dynamic-field/dynamic-field.model';
import { mapDynamicField } from './dynamic-field/dynamic-field.mapper';
import {
    buildFieldValidators,
    resolveFieldErrorMessage,
    resolveSequenceErrorMessage,
} from './dynamic-field/dynamic-field.validators';

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
            .map(([name, value]) => mapDynamicField(name, value))
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

    fieldHasError(
        field: DynamicField,
        formGroup?: FormGroup,
    ): boolean {
        const control = this.getFieldControl(field, formGroup);

        if (!control) {
            return false;
        }

        return control.invalid
            && (control.touched || control.dirty);
    }

    getFieldErrorMessage(
        field: DynamicField,
        formGroup?: FormGroup,
    ): string | null {
        const control = this.getFieldControl(field, formGroup);

        if (!control || !this.fieldHasError(field, formGroup)) {
            return null;
        }

        if (control.hasError('required')) {
            return 'This field is required';
        }

        return resolveFieldErrorMessage(control);
    }

    sequenceHasError(field: DynamicField): boolean {
        const array = this.getSequenceArray(field);

        return array.invalid
            && (array.touched || array.dirty);
    }

    getSequenceErrorMessage(field: DynamicField): string | null {
        const array = this.getSequenceArray(field);

        if (!this.sequenceHasError(field)) {
            return null;
        }

        if (array.hasError('minlength')) {
            return `Add at least ${field.minItems} item(s)`;
        }

        if (array.hasError('maxlength')) {
            return `Maximum ${field.maxItems} item(s) allowed`;
        }

        return resolveSequenceErrorMessage(array, field);
    }

    trackByFieldName(_: number, field: DynamicField): string {
        return field.name;
    }

    private createScalarControl(
        field: DynamicField,
    ): FormControl {
        return new FormControl(
            field.defaultValue ?? null,
            buildFieldValidators(field),
        );
    }

    private createSequenceArray(
        field: DynamicField,
    ): FormArray<FormGroup> {
        const items: FormGroup[] = [];
        const minItems = field.minItems ?? 0;
        const validators: ValidatorFn[] = [];

        for (let index = 0; index < minItems; index += 1) {
            items.push(this.createSequenceItemGroup(field));
        }

        if (minItems > 0) {
            validators.push(Validators.minLength(minItems));
        }

        if (field.maxItems !== undefined) {
            validators.push(Validators.maxLength(field.maxItems));
        }

        return new FormArray(items, validators);
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

    private getFieldControl(
        field: DynamicField,
        formGroup?: FormGroup,
    ): AbstractControl | null {
        const group = (formGroup ?? this.form()) as FormGroup;

        return group.get(field.name);
    }

}