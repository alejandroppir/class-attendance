import { format } from 'date-fns';
import { SelectionModel } from '@angular/cdk/collections';
import { AfterContentChecked, AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { tap, take } from 'rxjs';
import { IssuedMonth, IssuedMonthState, IssuedYear, Student, StudentUtils } from 'src/app/core/models/student.model';

import { FirestoreService } from '../../core/services/firestore.service';
import { StudentsPageUtils } from '../students-page/students-page.utils';
import { Group } from '../../core/models/groups.model';
import {
 HoursToRecoverComponent,
 HoursToRecoverDialogData,
} from '../../shared/components/hours-to-recover/hours-to-recover.component';
import { StudentsFirestoreInteractionService } from '../../core/services/students-firestore-interaction.service';
import { UtilsService } from '../../shared/services/utils.service';

export interface InvoicingStudentsTableRow extends Student {
 groupName: string;
 invoiceCost: number;
}
export interface IssuedStateConfig {
 icon: string;
 color: string;
 actual: IssuedMonthState;
 next: IssuedMonthState;
}

export interface ModifiedStudent {
 studentId: string;
 studentName: string;
 year: string;
 month: string;
 state: IssuedMonthState;
}
@Component({
 selector: 'app-invoicing-page',
 templateUrl: './invoicing-page.component.html',
 styleUrls: ['./invoicing-page.component.scss'],
})
export class InvoicingPageComponent implements OnInit, AfterContentChecked, AfterViewInit {
 studentModel!: Student;
 students: Student[] = [];
 studentsBackUp: Student[] = [];
 groups!: Group[];
 yearFilter: number;

 modifiedStudents: ModifiedStudent[] = [];

 public issuedMonthState = IssuedMonthState;
 public issuedStateConfig: { [key: string]: IssuedStateConfig } = {
  [IssuedMonthState.NotIssued]: {
   icon: 'disabled_by_default',
   color: 'orange',
   actual: IssuedMonthState.NotIssued,
   next: IssuedMonthState.Issued,
  },
  [IssuedMonthState.Issued]: {
   icon: 'check_box',
   color: 'green',
   actual: IssuedMonthState.Issued,
   next: IssuedMonthState.NotNeeded,
  },
  [IssuedMonthState.NotNeeded]: {
   icon: 'indeterminate_check_box',
   color: 'gray',
   actual: IssuedMonthState.NotNeeded,
   next: IssuedMonthState.NotIssued,
  },
 };

 //students table
 displayedColumns: string[] = ['alias', 'fullname', 'groupName', 'invoiceCost', 'year'];
 dataSource = this.loadTableData();
 selection = new SelectionModel<InvoicingStudentsTableRow>(true, []);
 @ViewChild(MatPaginator) paginator!: MatPaginator;
 paginatorSize: number[] = [5, 10, 25, 100];
 @ViewChild(MatSort) sort!: MatSort;

 //filters
 textFilter: string = '';
 groupFilter: string = '';

 constructor(
  private snackBar: MatSnackBar,
  private firestoreService: FirestoreService,
  private ref: ChangeDetectorRef,
  public dialog: MatDialog,
  private translate: TranslateService,
  private studentsFirestoreInteraction: StudentsFirestoreInteractionService,
  private utilsService: UtilsService,
 ) {
  this.yearFilter = Number(format(new Date(), 'yyyy'));
 }

 ngOnInit(): void {
  this.firestoreService
   .getStudents()
   .pipe(
    tap((students) => {
     this.students = students;
     this.studentsBackUp = JSON.parse(JSON.stringify(students));
     this.reloadTableData();
    }),
   )
   .subscribe();

  this.firestoreService
   .getGroups()
   .pipe(
    tap((groups) => {
     this.groups = groups.filter((group) => group.enabled);
     this.reloadTableData();
    }),
   )
   .subscribe();
 }

 openSnackBar(message: string) {
  this.snackBar.open(message, '', {
   duration: 5000,
  });
 }

 // Table
 applyFilter() {
  StudentsPageUtils.applyFilterToDataSource(this.dataSource, this.textFilter, [this.groupFilter]);
 }

 ngAfterContentChecked() {
  this.ref.detectChanges();
 }
 ngAfterViewInit(): void {
  this.reloadTableData();
 }

 public reloadTableData(): void {
  this.dataSource = this.loadTableData();
  this.dataSource.paginator = this.paginator;
  this.dataSource.sort = this.sort;
  this.dataSource.filterPredicate = StudentsPageUtils.getTableFilterPredicate();
  this.selection.clear();
 }

 private loadTableData(): MatTableDataSource<InvoicingStudentsTableRow> {
  const parsedStudents: InvoicingStudentsTableRow[] = this.students
   .map((student) => {
    StudentUtils.addEmptyIssuedYear(student, this.yearFilter);
    const studentInt: InvoicingStudentsTableRow = {
     ...student,
     groupName: '',
     invoiceCost: 0,
    };
    if (this.groups) {
     const group = this.groups.find((group) => group.id === student.group);
     if (group) {
      studentInt.groupName = group.groupName;
      studentInt.invoiceCost = group.price;
      return studentInt;
     }
    }
    return null;
   })
   .filter((student) => student !== null) as InvoicingStudentsTableRow[];

  return new MatTableDataSource<InvoicingStudentsTableRow>(parsedStudents);
 }

 textFilterChange(textFilter: string): void {
  this.textFilter = textFilter;
  this.applyFilter();
 }

 groupFilterChange(groupFilter: string): void {
  this.groupFilter = groupFilter;
  this.reloadTableData();
  this.applyFilter();
 }

 getFiltersNoMatch(): string {
  return [this.textFilter, []].filter((filters) => filters !== undefined).join(', ');
 }

 changeElementIssuedState(element: Student, month: string): void {
  const issuedMonth: IssuedMonth = (element.issued![this.yearFilter] as any)[month] as IssuedMonth;
  issuedMonth.issuedState = this.issuedStateConfig[issuedMonth.issuedState].next;
  const modifiedStudent: ModifiedStudent = {
   studentId: element.id,
   studentName: element.fullname,
   year: this.yearFilter.toString(),
   month,
   state: issuedMonth.issuedState,
  };
  this.modifiedStudents = this.modifiedStudents.filter(
   (student) => student.studentId !== modifiedStudent.studentId || student.month !== modifiedStudent.month,
  );
  this.modifiedStudents.push(modifiedStudent);
 }

 checkToRecover(element: Student, month: string): number {
  const issuedMonth: IssuedMonth = (element.issued![this.yearFilter] as any)[month] as IssuedMonth;
  return issuedMonth.dates.map((date) => date.hourToRecover).reduce((a, b) => a + b, 0);
 }

 public modifyFilterYear(sign: number): void {
  if (!this.yearFilter) {
   this.yearFilter = Number(format(new Date(), 'yyyy'));
  }
  this.yearFilter = this.yearFilter + 1 * sign;
  if (this.yearFilter < 0) {
   this.yearFilter = Number(format(new Date(), 'yyyy'));
  }
  this.reloadTableData();
 }

 openDialog(student: Student, month: string): void {
  const issuedMonth: IssuedMonth = (student.issued![this.yearFilter] as any)[month] as IssuedMonth;

  const data: HoursToRecoverDialogData = {
   studentName: student.fullname,
   showGoTo: false,
   dates: issuedMonth.dates.filter((date) => date.hourToRecover > 0),
  };
  const dialogRef = this.dialog.open(HoursToRecoverComponent, {
   data,
  });

  dialogRef.afterClosed().subscribe((date: number) => {
   if (date !== undefined) {
    this.openSnackBar(this.translate.instant('LOADING_DATE'));
   }
  });
 }

 reset(): void {
  this.students = JSON.parse(JSON.stringify(this.studentsBackUp));
  this.modifiedStudents = [];
  this.reloadTableData();
 }

 save(): void {
  const studentsIds = this.modifiedStudents.map((student) => student.studentId);
  const printElement = [...new Set(studentsIds)].map((studentId) => {
   const studentsFilteredById = this.modifiedStudents.filter((student) => student.studentId == studentId);
   const months = studentsFilteredById.reduce((group: { [key: string]: string[] }, item) => {
    const month = this.translate.instant(StudentUtils.parseMonthProperty(item.month));
    const state = this.translate.instant(item.state);
    const groupName = this.groups.find(
     (groupElement) => groupElement.id === this.students.find((student) => student.id === studentId)?.group,
    )?.groupName;
    const key = item.studentName + ' - ' + groupName;
    if (!group[key]) {
     group[key] = [];
    }
    group[key].push(`${item.year} - ${month} - ${state}`);
    return group;
   }, {});

   return months;
  });

  const students = printElement.map(
   (studentPrint) =>
    `${Object.keys(studentPrint)
     .map((key) => key + '\n\t' + studentPrint[key].join('\n\t'))
     .toString()}`,
  );
  this.utilsService.showConfirmationDialog('ISSUING_STUDENTS_TITLE', 'ISSUING_STUDENTS_QUESTION', students).subscribe({
   next: (res: boolean) => {
    if (res) {
     this.studentsFirestoreInteraction
      .saveHours(
       this.students,
       this.modifiedStudents.map((student) => student.studentId),
      )
      .pipe(take(1))
      .subscribe(() => {
       this.openSnackBar('Meses facturados');
       this.reset();
      });
    }
   },
  });
 }
}
