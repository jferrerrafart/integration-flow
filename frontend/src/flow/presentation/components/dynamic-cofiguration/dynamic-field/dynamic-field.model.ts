export interface DynamicField {
    name: string;
    type: string;
    use: 'required' | 'optional';
    description?: string;
    order: number;
    defaultValue?: string;

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