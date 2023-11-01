import { tap, map, Observable, concatMap } from 'rxjs';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FirestoreService } from 'src/app/core/services/firestore.service';

import { RoutingConstants } from '../../core/constants/general.constants';
import { format } from 'date-fns';
import { IssuedMonth, IssuedMonthState, Student, StudentUtils } from '../../core/models/student.model';
import { UtilsService } from '../services/utils.service';
import { Helper, HelperElement, HelperGroup, HelperUtils } from '../../core/models/helpers.model';
import { ConfirmationDialogData } from '../components/confirmation-dialog/confirmation-dialog.component';
import { Group } from '../../core/models/groups.model';

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
 helpers$: Observable<Helper[]>;

 constructor(private firestoreService: FirestoreService, private router: Router, private utilsService: UtilsService) {
  this.notIssued$ = this.firestoreService.getStudents().pipe(
   concatMap((students) => this.firestoreService.getGroups().pipe(map((groups) => ({ groups, students })))),
   map(({ groups, students }) => {
    const groupsFiltered = groups.filter((group) => group.enabled).map((group) => group.id);
    const date = new Date();
    const year = Number(format(date, 'yyyy'));
    const month = `m${format(date, 'MM').toLowerCase()}_${format(date, 'MMMM').toLowerCase()}`;
    students.forEach((student) => {
     StudentUtils.addEmptyIssuedYear(student, year);
    });
    return students.filter(
     (student) =>
      ((student.issued![year] as any)[month] as IssuedMonth).issuedState === IssuedMonthState.NotIssued &&
      groupsFiltered.includes(student.group),
    );
   }),
  );

  this.helpers$ = this.firestoreService.getHelpers();
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
 showHelpDialog(helpers: Helper[]): void {
  const helpersFormated = helpers
   .map((helper) => this.formatHelper(helper))
   .flat()
   .map((element) => `<pre class="row margin-0 override-font">${element} </pre>`);

  const config: ConfirmationDialogData = {
   confirmationTitle: 'Links de ayuda',
   confirmMessage: 'Estos son una serie de links que te pueden ser de ayuda',
   bodyData: ['<strong>Si no permite ver los videos online hay que descargarlos</strong>', ...helpersFormated],
   standarButtons: false,
  };

  this.utilsService.showConfirmationDialog(
   config.confirmationTitle,
   config.confirmMessage,
   config.bodyData,
   config.standarButtons,
  );
 }

 formatHelper(helper: Helper): string[] {
  let retValue: string[] = [];
  if (helper.hasOwnProperty('title')) {
   const helperElement: HelperElement = helper as HelperElement;
   retValue = [`> <a href="${helperElement.link}" target="_blank">${helperElement.title}</a>`];
  } else if (helper.hasOwnProperty('group')) {
   const helperGroup: HelperGroup = helper as HelperGroup;
   const helpersFormated = helperGroup.helpers
    .map((helperElement) => this.formatHelper(helperElement).map((heFormated) => `\t${heFormated}`))
    .flat();
   retValue = [`> ${helperGroup.group}:`, ...helpersFormated];
  }
  return retValue;
 }

 createHelps(): void {
  const helper1: Helper = {
   group: 'Asistencia',
   helpers: [
    {
     title: 'Presentación',
     link: 'https://drive.google.com/file/d/1in8cschPQE4YeCr_NX9DSndyAdouE3ie/view?usp=drive_link',
    },
    {
     group: 'Grupos',
     helpers: [
      {
       title: 'Crear grupos',
       link: 'https://drive.google.com/file/d/1K9c91xPTdC-ay9hsBcyzG24EeCb2netN/view?usp=drive_link',
      },
     ],
    },
    {
     group: 'Estudiantes',
     helpers: [
      {
       title: 'Crear estudiantes',
       link: 'https://drive.google.com/file/d/18peDY7UgeW2or9E2z7EHbYvElflm_1fQ/view?usp=drive_link',
      },
      {
       title: 'Filtrar',
       link: 'https://drive.google.com/file/d/10_Yxp9l8bq2_AQC7rTS48Uruq_xwcQFY/view?usp=drive_link',
      },
      {
       title: 'Modificar datos',
       link: 'https://drive.google.com/file/d/1JJqTCmIrLTHsQ0dnDV98a_y5QH1Z1KMe/view?usp=drive_link',
      },
      {
       title: 'Grupos deshabilitados',
       link: 'https://drive.google.com/file/d/1MFKiprmRyuV9DtQMnldBpSf7Dum1OLS8/view?usp=drive_link',
      },
     ],
    },
    {
     group: 'Asistencia',
     helpers: [
      {
       title: 'Presentación asistencia',
       link: 'https://drive.google.com/file/d/1pHIfvX_sJna-W23JZL7qCD4GRbyMSb6p/view?usp=drive_link',
      },
      {
       title: 'Marcar no asistencias',
       link: 'https://drive.google.com/file/d/1y1V2x9Ins9qu9tlPTxW4iHaNTPfJNS0L/view?usp=drive_link',
      },
      {
       title: 'Editar dias pasados',
       link: 'https://drive.google.com/file/d/1E9WsNnXXD2Ctd60lVikbLXMe-bTcOvRG/view?usp=drive_link',
      },
     ],
    },
    {
     group: 'Facturacion',
     helpers: [
      {
       title: 'Presentación facturación',
       link: 'https://drive.google.com/file/d/1b7bo9dD1wT-NPGW-KiOyy-NWpxKGu7hp/view?usp=drive_link',
      },
      {
       title: 'Facturar',
       link: 'https://drive.google.com/file/d/1kgX0Y9QWMBaT2SjYkWe9Zo4_STNCM0pC/view?usp=drive_link',
      },
      {
       title: 'Facturación múltiple',
       link: 'https://drive.google.com/file/d/17P94XC9GMa1QyatSENw5ou-ccqLF0XVy/view?usp=drive_link',
      },
      {
       title: 'Facturación no asistencias',
       link: 'https://drive.google.com/file/d/1mSTmvMazSYQSfFBJWIOxSHYqXjKLQJcH/view?usp=drive_link',
      },
     ],
    },
   ],
  };

  this.firestoreService.addHelper(HelperUtils.generateHelperId(), helper1);
 }
}
