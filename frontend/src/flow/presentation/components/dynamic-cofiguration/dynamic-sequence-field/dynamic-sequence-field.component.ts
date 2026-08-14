import { Component, computed, input } from '@angular/core';
import { FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import {
    DynamicField,
    EditorType,
    getFieldLabel,
    resolveEditorType,
} from '../dynamic-field/dynamic-field.model';
import { createSequenceItemGroup } from '../dynamic-field/dynamic-field.factory';
import { getFieldErrorMessage } from '../dynamic-field/dynamic-field.control-utils';
import { resolveSequenceErrorMessage } from '../dynamic-field/dynamic-field.validators';

@Component({
    selector: 'app-dynamic-sequence-field',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
    ],
    templateUrl: './dynamic-sequence-field.component.html',
    styleUrl: './dynamic-sequence-field.component.scss',
})
export class DynamicSequenceFieldComponent {
    readonly field = input.required<DynamicField>();
    readonly array = input.required<FormArray<FormGroup>>();

    readonly templateFields = computed<DynamicField[]>(
        () => this.field().appinfo?.sequenceTemplateFields ?? [],
    );

    getFieldLabel = getFieldLabel;

    getEditorType(field: DynamicField): EditorType {
        return resolveEditorType(field);
    }

    getFieldErrorMessage(
        item: FormGroup,
        field: DynamicField,
    ): string | null {
        return getFieldErrorMessage(item, field);
    }

    canAddItem(): boolean {
        const maxItems = this.field().appinfo?.maxItems;

        if (maxItems === undefined) {
            return true;
        }

        return this.array().length < maxItems;
    }

    canRemoveItem(): boolean {
        const minItems = this.field().appinfo?.minItems ?? 0;

        return this.array().length > minItems;
    }

    addItem(): void {
        if (!this.canAddItem()) {
            return;
        }

        this.array().push(createSequenceItemGroup(this.field()));
    }

    removeItem(index: number): void {
        if (!this.canRemoveItem()) {
            return;
        }

        this.array().removeAt(index);
    }

    sequenceErrorMessage(): string | null {
        const array = this.array();

        if (!array.invalid || !(array.touched || array.dirty)) {
            return null;
        }

        return resolveSequenceErrorMessage(array, this.field());
    }
}
