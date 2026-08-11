import { DynamicField } from './dynamic-field.model';

export function mapDynamicField(name: string, value: unknown): DynamicField {
    const field = value as Record<string, unknown>;
    const appinfo = field['appinfo'] as Record<string, unknown> | undefined;
    const sequence = appinfo?.['sequence'] === true;

    return {
        name,
        type: String(field['type'] ?? ''),
        use: field['use'] === 'required' ? 'required' : 'optional',
        description:
            typeof field['description'] === 'string'
                ? field['description']
                : undefined,
        order:
            typeof field['order'] === 'number'
                ? field['order']
                : 0,
        defaultValue: resolveDefaultValue(field, appinfo),
        sequence,
        minItems: parseMinItems(appinfo),
        maxItems: parseMaxItems(appinfo),
        sequenceTemplateFields: mapSequenceTemplate(appinfo),
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
                dynamic:
                    typeof appinfo['dynamic'] === 'boolean'
                        ? appinfo['dynamic']
                        : undefined,
                advanced:
                    typeof appinfo['advanced'] === 'boolean'
                        ? appinfo['advanced']
                        : undefined,
            }
            : undefined,
        enumeration:
            Array.isArray(appinfo?.['enumeration'])
                ? appinfo['enumeration'] as Array<{ value: string }>
                : Array.isArray(field['enumeration'])
                    ? field['enumeration'] as Array<{ value: string }>
                    : undefined,
    };
}

function parseMinItems(appinfo?: Record<string, unknown>): number {
    const rawMin = appinfo?.['min'];

    if (typeof rawMin !== 'string') {
        return 0;
    }

    const parsed = Number(rawMin);

    return Number.isFinite(parsed) ? parsed : 0;
}

function parseMaxItems(appinfo?: Record<string, unknown>): number | undefined {
    const rawMax = appinfo?.['max'];

    if (typeof rawMax !== 'string') {
        return undefined;
    }

    if (rawMax === 'unbounded') {
        return undefined;
    }

    const parsed = Number(rawMax);

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
    field: Record<string, unknown>,
    appinfo?: Record<string, unknown>,
): string | boolean | undefined {
    const fieldType =
        typeof appinfo?.['fieldType'] === 'string'
            ? appinfo['fieldType']
            : typeof field['type'] === 'string'
                ? field['type']
                : undefined;

    const rawDefault = field['defaultValue'] ?? appinfo?.['defaultValue'];

    if (fieldType === 'boolean') {
        if (typeof rawDefault === 'boolean') {
            return rawDefault;
        }

        if (typeof rawDefault === 'string') {
            return rawDefault.toLowerCase() === 'true';
        }

        return undefined;
    }

    return typeof rawDefault === 'string' ? rawDefault : undefined;
}
