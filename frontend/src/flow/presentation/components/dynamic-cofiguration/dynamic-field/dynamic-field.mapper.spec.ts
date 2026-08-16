import { mapDynamicField } from './dynamic-field.mapper';

describe('mapDynamicField', () => {
    it('marks a field as required only when use is exactly "required"', () => {
        expect(mapDynamicField('id', { use: 'required' }).use).toBe('required');
        expect(mapDynamicField('label', { use: 'optional' }).use).toBe('optional');
        expect(mapDynamicField('label', {}).use).toBe('optional');
    });

    it('parses description and order, defaulting order to 0', () => {
        const field = mapDynamicField('directory', {
            description: 'Output directory',
            order: 2,
        });

        expect(field.description).toBe('Output directory');
        expect(field.order).toBe(2);
        expect(mapDynamicField('id', {}).order).toBe(0);
    });

    it('resolves a boolean default value from a string, as used by "autostart"', () => {
        const field = mapDynamicField('autostart', {
            appinfo: { fieldType: 'boolean', defaultValue: 'true' },
        });

        expect(field.appinfo?.defaultValue).toBe(true);
    });

    it('keeps non-boolean default values as strings, as used by "return-type"', () => {
        const field = mapDynamicField('return-type', {
            appinfo: { fieldType: 'enumeration', defaultValue: 'TEXT' },
        });

        expect(field.appinfo?.defaultValue).toBe('TEXT');
    });

    it('preserves the enumeration array regardless of the fieldType string', () => {
        const field = mapDynamicField('messagepart', {
            appinfo: {
                fieldType: 'textenumeration',
                enumeration: [{ value: 'ALL' }, { value: 'msgprt0' }],
            },
        });

        expect(field.appinfo?.enumeration).toEqual([
            { value: 'ALL' },
            { value: 'msgprt0' },
        ]);
    });

    it('marks a field as a sequence and maps its template fields in order, as used by "exception-handling"', () => {
        const field = mapDynamicField('exception-handling', {
            appinfo: {
                sequence: true,
                min: '1',
                max: 'unbounded',
                sequencetemplate: {
                    'default-action': {
                        order: 0,
                        appinfo: { label: 'Action' },
                    },
                },
            },
        });

        expect(field.appinfo?.sequence).toBe(true);
        expect(field.appinfo?.minItems).toBe(1);
        expect(field.appinfo?.maxItems).toBeUndefined();
        expect(field.appinfo?.sequenceTemplateFields?.[0].name).toBe(
            'default-action',
        );
    });

    it('does not treat a field without a sequence flag as a sequence', () => {
        const field = mapDynamicField('id', { appinfo: { fieldType: 'string' } });

        expect(field.appinfo?.sequence).toBe(false);
        expect(field.appinfo?.sequenceTemplateFields).toBeUndefined();
    });
});
