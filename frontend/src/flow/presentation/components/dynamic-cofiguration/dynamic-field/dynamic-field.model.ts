export interface DynamicField {
    name: string;
    type: string;
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
        dynamic?: boolean;
        advanced?: boolean;
        enumeration?: Array<{
            value: string;
        }>;
    };
}