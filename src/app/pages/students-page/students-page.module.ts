import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { TranslateModule } from '@ngx-translate/core';

import { StudentsPageRoutingModule } from './students-page-routing.module';
import { StudentsPageComponent } from './students-page.component';
import { DateFilterModule } from 'src/app/shared/components/table-filters/date-filter/date-filter.module';
import { TextFilterModule } from 'src/app/shared/components/table-filters/text-filter/text-filter.module';
import { HoursToRecoverModule } from '../../shared/components/hours-to-recover/hours-to-recover.module';
import { ConfirmationDialogModule } from '../../shared/components/confirmation-dialog/confirmation-dialog.module';

@NgModule({
 declarations: [StudentsPageComponent],
 imports: [
  CommonModule,
  StudentsPageRoutingModule,
  MatAutocompleteModule,
  MatFormFieldModule,
  FormsModule,
  MatInputModule,
  ReactiveFormsModule,
  MatListModule,
  TranslateModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatIconModule,
  MatButtonModule,
  MatTableModule,
  MatCheckboxModule,
  MatPaginatorModule,
  MatSnackBarModule,
  MatChipsModule,
  DateFilterModule,
  TextFilterModule,
  HoursToRecoverModule,
  ConfirmationDialogModule,
 ],
})
export class StudentsPageModule {}
