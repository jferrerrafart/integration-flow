import { CommonModule, DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';

import { FlowResponseDto } from '../../../dto/flow-response.dto';

@Component({
    selector: 'app-flow-list',
    standalone: true,
    imports: [
        CommonModule,
        DatePipe,
        MatButtonModule,
        MatTableModule,
    ],
    templateUrl: './flow-list.component.html',
    styleUrl: './flow-list.component.scss',
})
export class FlowListComponent {
    readonly flows = input.required<FlowResponseDto[]>();

    readonly edit = output<FlowResponseDto>();

    readonly delete = output<number>();

    readonly displayedColumns = [
        'id',
        'name',
        'createdAt',
        'actions',
    ];

    onEdit(flow: FlowResponseDto): void {
        this.edit.emit(flow);
    }

    onDelete(flowId: number): void {
        this.delete.emit(flowId);
    }
}
