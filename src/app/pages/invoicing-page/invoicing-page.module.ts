import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvoicingPageComponent } from './invoicing-page.component';
import { RouterModule, Routes } from '@angular/router';
import { ChipFilterModule } from 'src/app/shared/components/table-filters/chip-filter/chip-filter.module';
import { TextFilterModule } from 'src/app/shared/components/table-filters/text-filter/text-filter.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { TranslateModule } from '@ngx-translate/core';
import { StudentManagementPageRoutingModule } from '../student-management-page/student-management-page-routing.module';
import { InputHoursDialogComponent } from './input-hours-dialog/input-hours-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';

const routes: Routes = [{ path: '', component: InvoicingPageComponent }];

@NgModule({
  declarations: [InvoicingPageComponent, InputHoursDialogComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ChipFilterModule,
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
  ],
})
export class InvoicingPageModule {}
