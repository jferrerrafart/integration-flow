import { Component, computed, effect, input, output, } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, FormArray, FormGroup, ReactiveFormsModule, } from '@angular/forms';
import { switchMap } from 'rxjs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { ConfigurationDefinitionDto } from '../../../../component-definition/dto/configuration-definition.dto';
import { DynamicField, EditorType, getFieldLabel, resolveEditorType } from './dynamic-field/dynamic-field.model';
import { mapDynamicField } from './dynamic-field/dynamic-field.mapper';
import { createScalarControl, createSequenceArray } from './dynamic-field/dynamic-field.factory';
import { fieldHasError, getFieldErrorMessage } from './dynamic-field/dynamic-field.control-utils';
import { DynamicSequenceFieldComponent } from './dynamic-sequence-field/dynamic-sequence-field.component';

@Component({
    selector: 'app-dynamic-configuration',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        DynamicSequenceFieldComponent,
    ],
    templateUrl: './dynamic-configuration.component.html',
    styleUrl: './dynamic-configuration.component.scss',
})
export class DynamicConfigurationComponent {
    readonly configuration =
        input.required<ConfigurationDefinitionDto>();

    readonly initialValue = input<Record<string, unknown> | null>(null);

    readonly valueChanged = output<Record<string, unknown>>();

    readonly fields = computed<DynamicField[]>(() => {
        const configuration = this.configuration().configuration;

        return Object.entries(configuration)
            .map(([name, value]) => mapDynamicField(name, value))
            .sort((a, b) => a.order - b.order);
    });

    readonly form = computed(() => {
        const group: Record<string, AbstractControl> = {};

        for (const field of this.fields()) {
            group[field.name] = field.appinfo?.sequence
                ? createSequenceArray(field)
                : createScalarControl(field);
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

    getSequenceArray(field: DynamicField): FormArray<FormGroup> {
        return this.form().get(field.name) as FormArray<FormGroup>;
    }

    getEditorType(field: DynamicField): EditorType {
        return resolveEditorType(field);
    }

    getFieldLabel = getFieldLabel;

    fieldHasError(field: DynamicField): boolean {
        return fieldHasError(this.form(), field);
    }

    getFieldErrorMessage(field: DynamicField): string | null {
        return getFieldErrorMessage(this.form(), field);
    }

}