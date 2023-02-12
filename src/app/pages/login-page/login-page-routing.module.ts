import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoutingConstants } from 'src/app/core/constants/general.constants';

import { LoginPageComponent } from './login-page.component';

const routes: Routes = [
  {
    path: RoutingConstants.PATH_EMPTY,
    component: LoginPageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class LoginPageRoutingModule {}
