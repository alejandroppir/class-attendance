import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface ConfirmationDialogData {
 confirmationTitle?: string;
 confirmMessage?: string;
 bodyData?: string[];
 standarButtons?: boolean;
}
@Component({
 selector: 'app-confirmation-dialog',
 templateUrl: './confirmation-dialog.component.html',
 styleUrls: ['./confirmation-dialog.component.scss'],
})
export class ConfirmationDialogComponent {
 constructor(
  public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
  @Inject(MAT_DIALOG_DATA) public data: ConfirmationDialogData,
 ) {}
}
