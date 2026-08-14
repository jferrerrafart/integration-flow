import {
    AbstractControl,
    FormArray,
    FormControl,
    FormGroup,
    ValidatorFn,
    Validators,
} from '@angular/forms';

import { DynamicField } from './dynamic-field.model';
import { buildFieldValidators } from './dynamic-field.validators';

export function createScalarControl(field: DynamicField): FormControl {
    return new FormControl(
        field.appinfo?.defaultValue ?? null,
        buildFieldValidators(field),
    );
}

export function createSequenceItemGroup(field: DynamicField): FormGroup {
    const templateFields = field.appinfo?.sequenceTemplateFields ?? [];
    const controls: Record<string, AbstractControl> = {};

    if (templateFields.length === 0) {
        controls['value'] = new FormControl('');
        return new FormGroup(controls);
    }

    for (const templateField of templateFields) {
        controls[templateField.name] = createScalarControl(templateField);
    }

    return new FormGroup(controls);
}

export function createSequenceArray(field: DynamicField): FormArray<FormGroup> {
    const items: FormGroup[] = [];
    const minItems = field.appinfo?.minItems ?? 0;
    const validators: ValidatorFn[] = [];

    for (let index = 0; index < minItems; index += 1) {
        items.push(createSequenceItemGroup(field));
    }

    if (minItems > 0) {
        validators.push(Validators.minLength(minItems));
    }

    if (field.appinfo?.maxItems !== undefined) {
        validators.push(Validators.maxLength(field.appinfo.maxItems));
    }

    return new FormArray(items, validators);
}
