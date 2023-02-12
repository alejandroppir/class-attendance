import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentManagementPageComponent } from './student-management-page.component';
import { StudentManagementPageRoutingModule } from './student-management-page-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatListModule } from '@angular/material/list';
import { ChipFilterModule } from 'src/app/shared/components/table-filters/chip-filter/chip-filter.module';
import { TextFilterModule } from 'src/app/shared/components/table-filters/text-filter/text-filter.module';

@NgModule({
  declarations: [StudentManagementPageComponent],
  imports: [
    CommonModule,
    FormsModule,
    StudentManagementPageRoutingModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    TranslateModule,
    MatButtonModule,
    MatSnackBarModule,
    MatTableModule,
    MatPaginatorModule,
    MatAutocompleteModule,
    MatListModule,
    MatIconModule,
    ChipFilterModule,
    TextFilterModule,
  ],
})
export class StudentManagementPageModule {}
