import { AbstractControl, FormGroup } from '@angular/forms';

import { DynamicField } from './dynamic-field.model';
import { resolveFieldErrorMessage } from './dynamic-field.validators';

export function getFieldControl(
    group: FormGroup,
    field: DynamicField,
): AbstractControl | null {
    return group.get(field.name);
}

export function fieldHasError(
    group: FormGroup,
    field: DynamicField,
): boolean {
    const control = getFieldControl(group, field);

    if (!control) {
        return false;
    }

    return control.invalid && (control.touched || control.dirty);
}

export function getFieldErrorMessage(
    group: FormGroup,
    field: DynamicField,
): string | null {
    const control = getFieldControl(group, field);

    if (!control || !fieldHasError(group, field)) {
        return null;
    }

    if (control.hasError('required')) {
        return 'This field is required';
    }

    return resolveFieldErrorMessage(control);
}
