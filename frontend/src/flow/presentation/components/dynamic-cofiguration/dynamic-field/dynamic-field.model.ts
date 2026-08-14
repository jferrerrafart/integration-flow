export interface DynamicField {
    name: string;
    use: 'required' | 'optional';
    description?: string;
    order: number;
    appinfo?: {
        fieldType?: string;
        label?: string;
        defaultValue?: string | boolean;
        sequence?: boolean;
        sequenceTemplateFields?: DynamicField[];
        minItems?: number;
        maxItems?: number;
        enumeration?: Array<{
            value: string;
        }>;
    };
}

export type EditorType = 'sequence' | 'select' | 'checkbox' | 'text';

export function resolveEditorType(field: DynamicField): EditorType {
    if (field.appinfo?.sequence) {
        return 'sequence';
    }

    if (field.appinfo?.enumeration) {
        return 'select';
    }

    if (field.appinfo?.fieldType === 'boolean') {
        return 'checkbox';
    }

    return 'text';
}

export function getFieldLabel(field: DynamicField): string {
    return field.appinfo?.label || field.name;
}