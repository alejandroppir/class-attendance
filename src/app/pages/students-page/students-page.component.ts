import { SelectionModel } from '@angular/cdk/collections';
import { formatDate } from '@angular/common';
import {
 AfterContentChecked,
 AfterViewInit,
 ChangeDetectorRef,
 Component,
 Inject,
 LOCALE_ID,
 OnInit,
 ViewChild,
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { format, parse, parseISO } from 'date-fns';
import { BehaviorSubject, tap } from 'rxjs';
import { FirestoreService } from 'src/app/core/services/firestore.service';

import { Group } from '../../core/models/groups.model';
import { IssuedDate, IssuedMonth, IssuedYear, Student, StudentUtils } from '../../core/models/student.model';
import { StudentsFirestoreInteractionService } from '../../core/services/students-firestore-interaction.service';
import { StudentsPageUtils } from './students-page.utils';
import {
 HoursToRecoverComponent,
 HoursToRecoverDialogData,
} from '../../shared/components/hours-to-recover/hours-to-recover.component';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';

export interface StudentTableRow extends Student {
 groupName: string;
 attendedHours: number;
 notAttendedHours: number;
 hasNotAttendedHours: number;
}

export interface TableFilter {
 text: string;
 groups: string[];
}

@Component({
 selector: 'app-students-page',
 templateUrl: './students-page.component.html',
 styleUrls: ['./students-page.component.scss'],
})
export class StudentsPageComponent implements OnInit, AfterContentChecked, AfterViewInit {
 public filterReset$: BehaviorSubject<boolean>;
 students: Student[] = [];
 studentsBackUp: Student[] = [];
 hoursToAdd: number = 0;
 hoursToSet: number = 0;
 filterDate: Date = new Date();
 groups!: Group[];

 //students table
 displayedColumns: string[] = ['select', 'alias', 'fullname', 'groupName', 'notAttendedHours', 'hasNotAttendedHours'];
 dataSource = this.loadTableData();
 selection = new SelectionModel<StudentTableRow>(true, []);
 @ViewChild(MatPaginator) paginator!: MatPaginator;
 paginatorSize: number[] = [5, 10, 25, 100];
 @ViewChild(MatSort) sort!: MatSort;

 modifiedStudents: string[] = [];

 textFilter: string = '';
 groupFilter: string = '';

 constructor(
  private ref: ChangeDetectorRef,
  @Inject(LOCALE_ID) private locale: string,
  private snackBar: MatSnackBar,
  private firestoreService: FirestoreService,
  private studentsFirestoreInteraction: StudentsFirestoreInteractionService,
  public dialog: MatDialog,
  private translate: TranslateService,
 ) {
  this.filterReset$ = new BehaviorSubject<boolean>(false);
 }

 ngOnInit() {
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

 ngAfterContentChecked() {
  this.ref.detectChanges();
 }

 ngAfterViewInit(): void {
  this.reloadTableData();
 }

 private reloadTableData(): void {
  this.dataSource = this.loadTableData();
  this.dataSource.paginator = this.paginator;
  this.dataSource.sort = this.sort;
  this.dataSource.filterPredicate = StudentsPageUtils.getTableFilterPredicate();
  this.selection.clear();
 }

 private loadTableData(): MatTableDataSource<StudentTableRow> {
  const dataFormatted = this.students.map((student) => {
   const extendedStudent: StudentTableRow = {
    ...student,
    groupName: '',
    attendedHours: 0,
    notAttendedHours: 0,
    hasNotAttendedHours: 0,
   };

   const date: Date = new Date(formatDate(this.filterDate, `yyyy-MM-dd`, this.locale));
   date.setHours(0, 0, 0, 0);

   const year = Number(format(date, 'yyyy'));
   const month = `m${format(date, 'MM').toLowerCase()}_${format(date, 'MMMM').toLowerCase()}`;
   const dateFormatted: string = format(date, 'yyyy-MM-dd');

   if (student.issued) {
    student = StudentUtils.addEmptyIssuedYear(student, year);
    const actualYear: IssuedYear | undefined = student.issued![year];
    if (actualYear) {
     const actualDate = ((actualYear as any)[month] as IssuedMonth).dates.find(
      (dateInt) => dateInt.date === dateFormatted,
     );
     if (actualDate) {
      extendedStudent.attendedHours = actualDate.hourAttended;
      extendedStudent.notAttendedHours = actualDate.hourToRecover;
     }
     extendedStudent.hasNotAttendedHours = this.checkToRecover(student);
    }
   }
   return extendedStudent;
  });

  let parsedStudents: StudentTableRow[] = [...dataFormatted];
  if (parsedStudents && this.groups) {
   parsedStudents = parsedStudents
    .map((student) => {
     const group = this.groups.find((group) => group.id === student.group);
     if (group) {
      student.groupName = group.groupName;
      return student;
     }
     return null;
    })
    .filter((student) => student !== null) as StudentTableRow[];
  }
  return new MatTableDataSource<StudentTableRow>(parsedStudents);
 }

 public modifyHours(sign: number): void {
  if (!this.hoursToAdd) {
   this.hoursToAdd = 0;
  }
  this.hoursToAdd = this.hoursToAdd + 0.5 * sign;
  if (this.hoursToAdd < 0) {
   this.hoursToAdd = 0;
  }
 }

 public addHoursToSelected(attended: boolean): void {
  if (!this.selection.selected || this.selection.selected.length == 0) {
   this.openSnackBar('No hay elementos seleccionados');
   return;
  }

  this.selection.selected.forEach((selection) => {
   this.modifiedStudents.push(selection.id);
   this.modifiedStudents = [...new Set(this.modifiedStudents)];
   let student = this.students.find((student) => student.id === selection.id);
   if (student == undefined) {
    return;
   }

   const date: Date = new Date(formatDate(this.filterDate, `yyyy-MM-dd`, this.locale));
   date.setHours(0, 0, 0, 0);

   const year = Number(format(date, 'yyyy'));
   const month = `m${format(date, 'MM').toLowerCase()}_${format(date, 'MMMM').toLowerCase()}`;
   const dateFormatted: string = format(date, 'yyyy-MM-dd');

   student = StudentUtils.addEmptyIssuedYear(student, year);

   const actualYear: IssuedYear | undefined = student.issued![year];
   if (actualYear) {
    let actualDate: IssuedDate | undefined = ((actualYear as any)[month] as IssuedMonth).dates.find(
     (dateInt) => dateInt.date === dateFormatted,
    );
    if (!actualDate) {
     actualDate = {
      date: dateFormatted,
      hourAttended: 0,
      hourToRecover: 0,
     };
     ((actualYear as any)[month] as IssuedMonth).dates.push(actualDate);
    }
    actualDate.hourAttended = attended
     ? this.hoursToAdd > 0
       ? (actualDate.hourAttended += this.hoursToAdd)
       : (actualDate.hourAttended = this.hoursToSet)
     : actualDate.hourAttended;
    actualDate.hourToRecover = !attended
     ? this.hoursToAdd > 0
       ? (actualDate.hourToRecover += this.hoursToAdd)
       : (actualDate.hourToRecover = this.hoursToSet)
     : actualDate.hourToRecover;
    ((actualYear as any)[month] as IssuedMonth).dates.sort((a, b) => (a.date > b.date ? 1 : b.date > a.date ? -1 : 0));
   }
  });
  this.reloadTableData();
  this.hoursToAdd = 0;
  this.hoursToSet = 0;
 }

 modifyUserHours(student: StudentTableRow, attended: boolean, hours: Event): void {
  this.hoursToSet = Number((hours.target as HTMLInputElement).value);
  this.selection.clear();
  this.selection.select(student);

  this.addHoursToSelected(attended);
 }

 public saveHours(): void {
  this.studentsFirestoreInteraction
   .saveHours(this.students, this.modifiedStudents)
   .subscribe(() => this.openSnackBar('Horas guardadas'));
 }

 public reset(): void {
  this.filterReset$.next(true);
  this.students = JSON.parse(JSON.stringify(this.studentsBackUp));
  this.modifiedStudents = [];
  this.reloadTableData();
 }

 public dateChange(event: Date): void {
  this.filterDate = new Date(event);
  this.reloadTableData();
 }

 isAllSelected(): boolean {
  return this.selection.selected.length === this.dataSource.data.length;
 }

 toggleAllRows(): void {
  if (this.isAllSelected()) {
   this.selection.clear();
  } else {
   this.selection.select(...this.dataSource.data);
  }
 }

 applyFilter() {
  StudentsPageUtils.applyFilterToDataSource(this.dataSource, this.textFilter, [this.groupFilter]);
 }

 openSnackBar(message: string) {
  this.snackBar.open(message, '', {
   duration: 5000,
  });
 }

 getFiltersNoMatch(): string {
  return [this.textFilter].filter((filters) => filters !== undefined).join(', ');
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

 checkToRecover(element: Student): number {
  const yearDates = this.getDatesToRecoverByYear(element);

  return yearDates.map((date) => date.hourToRecover).reduce((a, b) => a + b, 0);
 }

 private getDatesToRecoverByYear(element: Student): IssuedDate[] {
  const year = Number(format(this.filterDate, 'yyyy'));

  const yearDates = [
   ...element.issued![year].m01_january.dates.filter((date) => date.hourToRecover > 0),
   ...element.issued![year].m02_february.dates.filter((date) => date.hourToRecover > 0),
   ...element.issued![year].m03_march.dates.filter((date) => date.hourToRecover > 0),
   ...element.issued![year].m04_april.dates.filter((date) => date.hourToRecover > 0),
   ...element.issued![year].m05_may.dates.filter((date) => date.hourToRecover > 0),
   ...element.issued![year].m06_june.dates.filter((date) => date.hourToRecover > 0),
   ...element.issued![year].m07_july.dates.filter((date) => date.hourToRecover > 0),
   ...element.issued![year].m08_august.dates.filter((date) => date.hourToRecover > 0),
   ...element.issued![year].m09_september.dates.filter((date) => date.hourToRecover > 0),
   ...element.issued![year].m10_october.dates.filter((date) => date.hourToRecover > 0),
   ...element.issued![year].m11_november.dates.filter((date) => date.hourToRecover > 0),
   ...element.issued![year].m12_december.dates.filter((date) => date.hourToRecover > 0),
  ];
  return yearDates;
 }

 openDialog(student: Student): void {
  const dates = this.getDatesToRecoverByYear(student);
  const data: HoursToRecoverDialogData = {
   studentName: student.fullname,
   showGoTo: true,
   dates: dates,
  };
  const dialogRef = this.dialog.open(HoursToRecoverComponent, {
   data,
  });

  dialogRef.afterClosed().subscribe((date: string) => {
   if (date !== undefined) {
    this.openSnackBar(this.translate.instant('LOADING_DATE'));
    this.filterDate = new Date(format(parseISO(date), 'yyyy-MM-dd'));
    this.reloadTableData();
   }
  });
 }

 goToday(): void {
  this.dateChange(new Date());
  this.openSnackBar('Hora cambiada');
 }
}
