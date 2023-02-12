import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RoutingConstants } from '../../core/constants/general.constants';
import { StudentManagementPageComponent } from './student-management-page.component';

const routes: Routes = [
  {
    path: RoutingConstants.PATH_EMPTY,
    component: StudentManagementPageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class StudentManagementPageRoutingModule {}
