import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HoursToRecoverComponent } from './hours-to-recover.component';
import { TranslateModule } from '@ngx-translate/core';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { BrowserModule } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
 declarations: [HoursToRecoverComponent],
 imports: [CommonModule, FormsModule, TranslateModule, MatDialogModule, MatButtonModule, ReactiveFormsModule, MatIconModule],
 exports: [HoursToRecoverComponent],
})
export class HoursToRecoverModule {}
