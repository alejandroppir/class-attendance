import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { map, tap } from 'rxjs';
import { FirestoreService } from 'src/app/core/services/firestore.service';

import { RoutingConstants } from '../../core/constants/general.constants';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
})
export class ToolbarComponent {
  routeHome = RoutingConstants.PATH_HOME;
  routeStudents = RoutingConstants.PATH_MANAGE_ASSISTANCE;
  routeStudentsManagement = RoutingConstants.PATH_STUDENT_MANAGEMENT;
  routeInvoicing = RoutingConstants.PATH_INVOICING;
  groups = RoutingConstants.PATH_GROUPS;
  needInvoicing: boolean = false;

  constructor(
    private firestoreService: FirestoreService,
    private router: Router
  ) {
    this.firestoreService
      .getStudents()
      .pipe(
        map((students) => {
          return students.some((student) => {
            if (student.dates) {
              const pendingHours = student.dates.reduce(
                (partialSum, date) =>
                  partialSum + (date.hours - date.issuedHours),
                0
              );
              if (student.hoursToAdvice < pendingHours) {
                return true;
              }
            }
            return false;
          });
        }),
        tap((res) => {
          this.needInvoicing = res;
        })
      )
      .subscribe();
  }

  navigateInvoice(): void {
    this.router.navigate([RoutingConstants.PATH_INVOICING]);
  }
}
