import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { FlowEditorComponent } from '../../components/flow-editor/flow-editor.component';

@Component({
    selector: 'app-flow-manager',
    standalone: true,
    imports: [MatButtonModule, MatDialogModule, FlowEditorComponent],
    templateUrl: './flow-manager.component.html',
    styleUrl: './flow-manager.component.scss',
})
export class FlowManagerComponent {
    constructor(private dialog: MatDialog) { }

    openNewFlowDialog(): void {
        this.dialog.open(FlowEditorComponent);
    }
}