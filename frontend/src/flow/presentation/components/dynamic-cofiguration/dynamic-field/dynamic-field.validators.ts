import {
    AbstractControl,
    FormArray,
    ValidationErrors,
    ValidatorFn,
    Validators,
} from '@angular/forms';

import { DynamicField } from './dynamic-field.model';

export function buildFieldValidators(field: DynamicField): ValidatorFn[] {
    const validators: ValidatorFn[] = [];

    if (field.use === 'required') {
        validators.push(Validators.required);
    }

    const fieldType = field.appinfo?.fieldType ?? field.type;

    if (fieldType === 'cron') {
        validators.push(cronValidator());
    }

    if (fieldType === 'enumeration' || fieldType === 'textenumeration') {
        validators.push(enumerationValidator(field));
    }

    return validators;
}

export function resolveFieldErrorMessage(control: AbstractControl): string {
    if (control.hasError('required')) {
        return 'This field is required';
    }

    if (control.hasError('invalidCron')) {
        return 'Use Quartz cron format (6 or 7 parts, e.g. 0 0/5 * * * ?)';
    }

    if (control.hasError('invalidOption')) {
        return 'Select one of the allowed values';
    }

    return 'Invalid value';
}

export function resolveSequenceErrorMessage(
    array: FormArray,
    field: DynamicField,
): string {
    if (array.hasError('minlength')) {
        return `Add at least ${field.appinfo?.minItems} item(s)`;
    }

    if (array.hasError('maxlength')) {
        return `Maximum ${field.appinfo?.maxItems} item(s) allowed`;
    }

    return 'Invalid sequence';
}

function cronValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const value = control.value;

        if (value === null || value === undefined || value === '') {
            return null;
        }

        if (typeof value !== 'string') {
            return { invalidCron: true };
        }

        const parts = value.trim().split(/\s+/);

        return parts.length === 6 || parts.length === 7
            ? null
            : { invalidCron: true };
    };
}

function enumerationValidator(field: DynamicField): ValidatorFn {
    const allowedValues = new Set(
        (field.appinfo?.enumeration ?? []).map((option) => option.value),
    );

    return (control: AbstractControl): ValidationErrors | null => {
        const value = control.value;

        if (value === null || value === undefined || value === '') {
            return null;
        }

        return allowedValues.has(String(value))
            ? null
            : { invalidOption: true };
    };
}
