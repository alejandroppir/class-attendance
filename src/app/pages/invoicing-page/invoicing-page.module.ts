import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TextFilterModule } from 'src/app/shared/components/table-filters/text-filter/text-filter.module';
import { InvoicingPageComponent } from './invoicing-page.component';
import { HoursToRecoverModule } from '../../shared/components/hours-to-recover/hours-to-recover.module';

const routes: Routes = [{ path: '', component: InvoicingPageComponent }];

@NgModule({
 declarations: [InvoicingPageComponent],
 imports: [
  CommonModule,
  RouterModule.forChild(routes),
  TextFilterModule,
  FormsModule,
  ReactiveFormsModule,
  MatFormFieldModule,
  MatInputModule,
  TranslateModule,
  MatButtonModule,
  MatSnackBarModule,
  MatTableModule,
  MatPaginatorModule,
  MatListModule,
  MatIconModule,
  MatDialogModule,
  MatSelectModule,
  HoursToRecoverModule,
 ],
})
export class InvoicingPageModule {}
