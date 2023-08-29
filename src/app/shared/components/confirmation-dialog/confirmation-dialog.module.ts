import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';

import { ConfirmationDialogComponent } from './confirmation-dialog.component';

@NgModule({
 declarations: [ConfirmationDialogComponent],
 imports: [CommonModule, MatButtonModule, MatDialogModule, TranslateModule],
 exports: [ConfirmationDialogComponent],
})
export class ConfirmationDialogModule {}
