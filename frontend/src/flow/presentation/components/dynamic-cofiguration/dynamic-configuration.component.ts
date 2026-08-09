import { Component, input } from '@angular/core';
import { JsonPipe } from '@angular/common';

import { ComponentDefinitionConfigurationDto } from '../../../../component-definition/dto/component-definition-configuration.dto';

@Component({
    selector: 'app-dynamic-configuration',
    standalone: true,
    imports: [
        JsonPipe
    ],
    templateUrl: './dynamic-configuration.component.html',
    styleUrl: './dynamic-configuration.component.scss',
})
export class DynamicConfigurationComponent {
    readonly configuration =
        input.required<ComponentDefinitionConfigurationDto>();
}