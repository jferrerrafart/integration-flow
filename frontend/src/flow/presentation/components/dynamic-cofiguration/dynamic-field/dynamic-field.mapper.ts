import { DynamicField } from './dynamic-field.model';

export function mapDynamicField(name: string, value: unknown): DynamicField {
    const field = value as Record<string, unknown>;
    const appinfo = field['appinfo'] as Record<string, unknown> | undefined;
    const sequence = appinfo?.['sequence'] === true;

    return {
        name,
        use: field['use'] === 'required' ? 'required' : 'optional',
        description:
            typeof field['description'] === 'string'
                ? field['description']
                : undefined,
        order:
            typeof field['order'] === 'number'
                ? field['order']
                : 0,
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
                defaultValue: resolveDefaultValue(appinfo),
                sequence,
                sequenceTemplateFields: mapSequenceTemplate(appinfo),
                minItems: parseMinItems(appinfo),
                maxItems: parseMaxItems(appinfo),
                enumeration:
                    Array.isArray(appinfo['enumeration'])
                        ? appinfo['enumeration'] as Array<{ value: string }>
                        : undefined,
            }
            : undefined,
    };
}

function parseMinItems(appinfo?: Record<string, unknown>): number {
    const parsed = Number(appinfo?.['min']);

    return Number.isFinite(parsed) ? parsed : 0;
}

function parseMaxItems(appinfo?: Record<string, unknown>): number | undefined {
    const parsed = Number(appinfo?.['max']);

    return Number.isFinite(parsed) ? parsed : undefined;
}

function mapSequenceTemplate(appinfo?: Record<string, unknown>): DynamicField[] | undefined {
    const rawTemplate = appinfo?.['sequencetemplate'];

    if (!rawTemplate || Array.isArray(rawTemplate)) {
        return undefined;
    }

    if (typeof rawTemplate !== 'object') {
        return undefined;
    }

    const template = rawTemplate as Record<string, unknown>;

    return Object.entries(template)
        .map(([fieldName, fieldValue]) => mapDynamicField(fieldName, fieldValue))
        .sort((a, b) => a.order - b.order);
}

function resolveDefaultValue(
    appinfo?: Record<string, unknown>,
): string | boolean | undefined {
    const rawDefault = appinfo?.['defaultValue'];

    if (appinfo?.['fieldType'] === 'boolean') {
        if (typeof rawDefault === 'boolean') {
            return rawDefault;
        }

        return typeof rawDefault === 'string'
            ? rawDefault.toLowerCase() === 'true'
            : undefined;
    }

    return typeof rawDefault === 'string' ? rawDefault : undefined;
}
