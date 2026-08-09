import { Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { FlowEditorComponent } from '../../components/flow-editor/flow-editor.component';
import { FlowListComponent } from '../../components/flow-list/flow-list.component';
import { FlowFacade } from '../../../aplication/flow.facade';
import { FlowResponseDto } from '../../../dto/flow-response.dto';

@Component({
    selector: 'app-flow-manager',
    standalone: true,
    imports: [
        MatButtonModule,
        MatDialogModule,
        FlowListComponent,
    ],
    templateUrl: './flow-manager.component.html',
    styleUrl: './flow-manager.component.scss',
})
export class FlowManagerComponent implements OnInit {
    private readonly dialog = inject(MatDialog);
    readonly flowFacade = inject(FlowFacade);

    ngOnInit(): void {
        void this.flowFacade.loadAll();
    }

    openNewFlowDialog(): void {
        this.dialog.open(FlowEditorComponent, {
            width: '700px',
            maxWidth: '700px',
        });
    }

    openEditFlowDialog(flow: FlowResponseDto): void {
        this.dialog.open(FlowEditorComponent, {
            width: '700px',
            maxWidth: '700px',
            data: { flow },
        });
    }

    async deleteFlow(flowId: number): Promise<void> {
        const confirmed = window.confirm(
            'Delete this flow permanently?',
        );

        if (!confirmed) {
            return;
        }

        try {
            await this.flowFacade.remove(flowId);
        } catch (error) {
            console.error('Error deleting flow', error);
        }
    }
}