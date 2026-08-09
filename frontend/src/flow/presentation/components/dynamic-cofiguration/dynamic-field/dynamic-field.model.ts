export interface DynamicField {
    name: string;
    type: string;
    use: 'required' | 'optional';
    description?: string;
    order: number;
    defaultValue?: string | boolean;
    sequence?: boolean;
    minItems?: number;
    maxItems?: number;
    sequenceTemplateFields?: DynamicField[];

    appinfo?: {
        fieldType?: string;
        label?: string;
        dynamic?: boolean;
        advanced?: boolean;
    };

    enumeration?: Array<{
        value: string;
    }>;
}