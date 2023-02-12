import { I } from '@angular/cdk/keycodes';
import { Component, Inject } from '@angular/core';
import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';

export interface InputHoursDialogData {
  studentName: string;
  hours: number;
}

@Component({
  selector: 'app-input-hours-dialog',
  templateUrl: './input-hours-dialog.component.html',
  styleUrls: ['./input-hours-dialog.component.scss'],
})
export class InputHoursDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<InputHoursDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: InputHoursDialogData
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
  onAcceptClick(): void {
    if (typeof this.data.hours == 'number' && this.data.hours > 0) {
      this.dialogRef.close(this.data.hours);
    }
  }
}
