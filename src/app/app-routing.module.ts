import { NgModule } from '@angular/core';
import {
  canActivate as canActivateFire,
  redirectLoggedInTo,
  redirectUnauthorizedTo,
} from '@angular/fire/auth-guard';
import { RouterModule, Routes } from '@angular/router';

import { RoutingConstants } from './core/constants/general.constants';

const routes: Routes = [
  {
    path: RoutingConstants.PATH_EMPTY,
    loadChildren: () =>
      import('./../app/pages/home-page/home-page.module').then(
        (m) => m.HomePageModule
      ),
  },
  {
    path: RoutingConstants.PATH_HOME,
    loadChildren: () =>
      import('./../app/pages/home-page/home-page.module').then(
        (m) => m.HomePageModule
      ),
  },
  {
    path: RoutingConstants.PATH_LOGIN,
    loadChildren: () =>
      import('./../app/pages/login-page/login-page.module').then(
        (m) => m.LoginPageModule
      ),
    ...canActivateFire(() =>
      redirectLoggedInTo([`/${RoutingConstants.PATH_EMPTY}`])
    ),
  },
  {
    path: RoutingConstants.PATH_MANAGE_ASSISTANCE,
    loadChildren: () =>
      import('./../app/pages/students-page/students-page.module').then(
        (m) => m.StudentsPageModule
      ),
    ...canActivateFire(() =>
      redirectUnauthorizedTo([RoutingConstants.PATH_LOGIN])
    ),
  },
  {
    path: RoutingConstants.PATH_INVOICING,
    loadChildren: () =>
      import('./../app/pages/invoicing-page/invoicing-page.module').then(
        (m) => m.InvoicingPageModule
      ),
    ...canActivateFire(() =>
      redirectUnauthorizedTo([RoutingConstants.PATH_LOGIN])
    ),
  },
  {
    path: RoutingConstants.PATH_GROUPS,
    loadChildren: () =>
      import('./../app/pages/group-page/group-page.module').then(
        (m) => m.GroupPageModule
      ),
    ...canActivateFire(() =>
      redirectUnauthorizedTo([RoutingConstants.PATH_LOGIN])
    ),
  },
  {
    path: RoutingConstants.PATH_STUDENT_MANAGEMENT,
    loadChildren: () =>
      import(
        './../app/pages/student-management-page/student-management-page.module'
      ).then((m) => m.StudentManagementPageModule),
    ...canActivateFire(() =>
      redirectUnauthorizedTo([RoutingConstants.PATH_LOGIN])
    ),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
