import { tap, map, Observable } from 'rxjs';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FirestoreService } from 'src/app/core/services/firestore.service';

import { RoutingConstants } from '../../core/constants/general.constants';
import { format } from 'date-fns';
import { IssuedMonth, IssuedMonthState, Student, StudentUtils } from '../../core/models/student.model';
import { UtilsService } from '../services/utils.service';

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
 notIssued$: Observable<Student[]>;

 constructor(private firestoreService: FirestoreService, private router: Router, private utilsService: UtilsService) {
  this.notIssued$ = this.firestoreService.getStudents().pipe(
   map((students) => {
    const date = new Date();
    const year = Number(format(date, 'yyyy'));
    const month = `m${format(date, 'MM').toLowerCase()}_${format(date, 'MMMM').toLowerCase()}`;
    students.forEach((student) => {
     StudentUtils.addEmptyIssuedYear(student, year);
    });
    return students.filter((student) => ((student.issued![year] as any)[month] as IssuedMonth).issuedState === IssuedMonthState.NotIssued);
   }),
  );
 }

 navigateInvoice(): void {
  this.router.navigate([RoutingConstants.PATH_INVOICING]);
 }

 showNotIssuedStudents(notIssuedStudents: Student[]): void {
  this.utilsService
   .showConfirmationDialog('STUDENTS_NOT_ISSUED_TITLE', 'STUDENTS_NOT_ISSUED_QUESTION', [
    '\n\n',
    ...notIssuedStudents.map((student) => student.fullname),
   ])
   .subscribe({
    next: (res: boolean) => {
     if (res) {
      this.navigateInvoice();
     }
    },
   });
 }
}
