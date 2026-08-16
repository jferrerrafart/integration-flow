import { FormControl } from '@angular/forms';

import { DynamicField } from './dynamic-field.model';
import { buildFieldValidators, resolveFieldErrorMessage } from './dynamic-field.validators';

function buildField(overrides: Partial<DynamicField> = {}): DynamicField {
    return {
        name: 'field',
        use: 'optional',
        order: 0,
        ...overrides,
    };
}

describe('buildFieldValidators', () => {
    it('adds a required validator only when use is "required"', () => {
        const required = new FormControl(
            '',
            buildFieldValidators(buildField({ use: 'required' })),
        );
        const optional = new FormControl(
            '',
            buildFieldValidators(buildField({ use: 'optional' })),
        );

        expect(required.invalid).toBe(true);
        expect(optional.valid).toBe(true);
    });

    it('validates the Quartz cron format for fieldType "cron"', () => {
        const validators = buildFieldValidators(
            buildField({ appinfo: { fieldType: 'cron' } }),
        );

        expect(new FormControl('0 0/5 * * * ?', validators).valid).toBe(true);
        expect(new FormControl('invalid cron', validators).valid).toBe(false);
        expect(new FormControl('', validators).valid).toBe(true);
    });

    it('validates that the value belongs to the declared enumeration', () => {
        const validators = buildFieldValidators(
            buildField({
                appinfo: { enumeration: [{ value: 'TEXT' }, { value: 'XML' }] },
            }),
        );

        expect(new FormControl('TEXT', validators).valid).toBe(true);
        expect(new FormControl('BYTES', validators).valid).toBe(false);
        expect(new FormControl('', validators).valid).toBe(true);
    });
});

describe('resolveFieldErrorMessage', () => {
    it('describes each known validation error distinctly', () => {
        const requiredControl = new FormControl('', [
            ...buildFieldValidators(buildField({ use: 'required' })),
        ]);
        const cronControl = new FormControl('bad cron', [
            ...buildFieldValidators(buildField({ appinfo: { fieldType: 'cron' } })),
        ]);
        const enumerationControl = new FormControl('unknown', [
            ...buildFieldValidators(
                buildField({ appinfo: { enumeration: [{ value: 'TEXT' }] } }),
            ),
        ]);

        expect(resolveFieldErrorMessage(requiredControl)).toBe(
            'This field is required',
        );
        expect(resolveFieldErrorMessage(cronControl)).toContain('Quartz cron format');
        expect(resolveFieldErrorMessage(enumerationControl)).toBe(
            'Select one of the allowed values',
        );
    });
});
