import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { map, Observable } from 'rxjs';

import {
 ConfirmationDialogComponent,
 ConfirmationDialogData,
} from '../components/confirmation-dialog/confirmation-dialog.component';
import { AppInjector } from './../../app.module';

@Injectable({ providedIn: 'root' })
export class UtilsService {
 constructor(
  private _snackBar: MatSnackBar,
  private _translate: TranslateService,
  private sanitizer: DomSanitizer,
  private dialog: MatDialog,
 ) {}

 static getService(service: any): any {
  return AppInjector.get<typeof service>(service as typeof service);
 }

 static createService(service: any, args: any[]): any {
  return new service(...args);
 }

 showConfirmationDialog(
  confirmationTitle: string = '',
  confirmMessage: string = '',
  bodyData: string[] = [],
  standarButtons: boolean = true,
 ): Observable<boolean> {
  const data: ConfirmationDialogData = { confirmationTitle, confirmMessage, bodyData, standarButtons };
  const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
   width: '500px',
   data,
  });

  return dialogRef.afterClosed().pipe(map((res) => res == true));
 }

 showSnackBar(message: string): void {
  this._snackBar.open(this._translate.instant(message), this._translate.instant('ACCEPT'), {
   duration: 3000,
   panelClass: ['mat-toolbar', 'mat-primary'],
  });
 }

 translate(text: string): string {
  return this._translate.instant(text);
 }

 sanitizeImage(file: File): SafeUrl {
  return this.sanitizer.bypassSecurityTrustUrl(window.URL.createObjectURL(file));
 }
 sanitizeURL(url: string): SafeUrl {
  return this.sanitizer.bypassSecurityTrustUrl(url);
 }

 buildDriveImage(imageId: string): string {
  return `https://drive.google.com/uc?export=view&id=${imageId}`;
 }
}
