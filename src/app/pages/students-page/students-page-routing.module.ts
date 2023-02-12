import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RoutingConstants } from '../../core/constants/general.constants';
import { StudentsPageComponent } from './students-page.component';

const routes: Routes = [
  {
    path: RoutingConstants.PATH_EMPTY,
    component: StudentsPageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class StudentsPageRoutingModule {}
