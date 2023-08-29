import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IssuedDate } from '../../../core/models/student.model';

export interface HoursToRecoverDialogData {
 studentName: string;
 dates: IssuedDate[];
 showGoTo: boolean;
}

@Component({
 selector: 'app-hours-to-recover',
 templateUrl: './hours-to-recover.component.html',
 styleUrls: ['./hours-to-recover.component.scss'],
})
export class HoursToRecoverComponent implements OnInit {
 constructor(public dialogRef: MatDialogRef<HoursToRecoverComponent>, @Inject(MAT_DIALOG_DATA) public data: HoursToRecoverDialogData) {}

 ngOnInit(): void {
  console.log();
 }

 emitDateAndClose(date: string): void {
  this.dialogRef.close(date);
 }
 onNoClick(): void {
  this.dialogRef.close();
 }
}
