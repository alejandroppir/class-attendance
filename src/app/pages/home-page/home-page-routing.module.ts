import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RoutingConstants } from '../../core/constants/general.constants';
import { HomePageComponent } from './home-page.component';

const routes: Routes = [
  {
    path: RoutingConstants.PATH_EMPTY,
    component: HomePageComponent,
  },
  {
    path: RoutingConstants.PATH_HOME,
    component: HomePageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class HomePageRoutingModule {}
