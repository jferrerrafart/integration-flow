export type ComponentRole = 'consumer' | 'service' | 'producer';

export interface ComponentDefinition {
    id: string;
    name: string;
    description: string;
    type: string;
    role: ComponentRole;
    available: boolean;
}