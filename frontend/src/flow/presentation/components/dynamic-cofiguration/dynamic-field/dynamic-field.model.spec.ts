import { DynamicField, getFieldLabel, resolveEditorType } from './dynamic-field.model';

function buildField(overrides: Partial<DynamicField> = {}): DynamicField {
    return {
        name: 'field',
        use: 'optional',
        order: 0,
        ...overrides,
    };
}

describe('resolveEditorType', () => {
    it('resolves sequence fields first, even if they also carry an enumeration', () => {
        const field = buildField({
            appinfo: { sequence: true, enumeration: [{ value: 'a' }] },
        });

        expect(resolveEditorType(field)).toBe('sequence');
    });

    it('resolves an enumeration to "select" regardless of the fieldType string', () => {
        const textEnumeration = buildField({
            appinfo: { fieldType: 'textenumeration', enumeration: [{ value: 'ALL' }] },
        });
        const enumeration = buildField({
            appinfo: { fieldType: 'enumeration', enumeration: [{ value: 'TEXT' }] },
        });

        expect(resolveEditorType(textEnumeration)).toBe('select');
        expect(resolveEditorType(enumeration)).toBe('select');
    });

    it('resolves fieldType "boolean" to "checkbox"', () => {
        const field = buildField({ appinfo: { fieldType: 'boolean' } });

        expect(resolveEditorType(field)).toBe('checkbox');
    });

    it('falls back to "text" for fieldTypes with no dedicated control, such as "cron"', () => {
        expect(resolveEditorType(buildField({ appinfo: { fieldType: 'cron' } }))).toBe(
            'text',
        );
        expect(
            resolveEditorType(buildField({ appinfo: { fieldType: 'beanreference' } })),
        ).toBe('text');
        expect(resolveEditorType(buildField())).toBe('text');
    });
});

describe('getFieldLabel', () => {
    it('uses the appinfo label when present', () => {
        const field = buildField({ appinfo: { label: 'Quartz Cron Expression' } });

        expect(getFieldLabel(field)).toBe('Quartz Cron Expression');
    });

    it('falls back to the field name when there is no label', () => {
        expect(getFieldLabel(buildField({ name: 'cron-expression' }))).toBe(
            'cron-expression',
        );
        expect(
            getFieldLabel(buildField({ name: 'id', appinfo: { label: '' } })),
        ).toBe('id');
    });
});
