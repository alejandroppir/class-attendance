import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { ChipFilterModule } from '../../shared/components/table-filters/chip-filter/chip-filter.module';
import { TextFilterModule } from '../../shared/components/table-filters/text-filter/text-filter.module';
import { GroupPageComponent } from './group-page.component';

const routes: Routes = [{ path: '', component: GroupPageComponent }];

@NgModule({
  declarations: [GroupPageComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
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
    MatCardModule,
  ],
})
export class GroupPageModule {}
