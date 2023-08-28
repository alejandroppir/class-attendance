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
import { format } from 'date-fns';
import { BehaviorSubject, tap } from 'rxjs';
import { FirestoreService } from 'src/app/core/services/firestore.service';

import { Group } from '../../core/models/groups.model';
import {
  IssuedDate,
  IssuedMonth,
  IssuedMonthState,
  IssuedYear,
  Student,
} from '../../core/models/student.model';
import { StudentsFirestoreInteractionService } from './students-firestore-interaction.service';
import { StudentsPageUtils } from './students-page.utils';

export interface StudentTableRow extends Student {
  attendedHours: number;
  notAttendedHours: number;
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
export class StudentsPageComponent
  implements OnInit, AfterContentChecked, AfterViewInit
{
  public filterReset$: BehaviorSubject<boolean>;
  students: Student[] = [];
  studentsBackUp: Student[] = [];
  hoursToAdd: number = 0;
  filterDate: Date = new Date();
  groups!: Group[];

  //students table
  displayedColumns: string[] = [
    'select',
    'fullname',
    'dni',
    'group',
    'attendedHours',
    'notAttendedHours',
  ];
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
    private studentsFirestoreInteraction: StudentsFirestoreInteractionService
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
        })
      )
      .subscribe();

    this.firestoreService
      .getGroups()
      .pipe(
        tap((groups) => {
          this.groups = groups;
          this.reloadTableData();
        })
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
    this.dataSource.filterPredicate =
      StudentsPageUtils.getTableFilterPredicate();
    this.selection.clear();
  }

  private loadTableData(): MatTableDataSource<StudentTableRow> {
    const dataFormatted = this.students.map((student) => {
      const extendedStudent: StudentTableRow = {
        ...student,
        attendedHours: 0,
        notAttendedHours: 0,
      };

      const date: Date = new Date(
        formatDate(this.filterDate, `yyyy-MM-dd`, this.locale)
      );
      date.setHours(0, 0, 0, 0);

      const year = Number(format(date, 'yyyy'));
      const month = `m${format(date, 'MM').toLowerCase()}_${format(
        date,
        'MMMM'
      ).toLowerCase()}`;
      const dateFormatted: string = format(date, 'yyyy-MM-dd');

      if (student.issued) {
        const actualYear: IssuedYear | undefined = student.issued.find(
          (issued) => issued.i_year === year
        );
        if (actualYear) {
          const actualDate = (
            (actualYear as any)[month] as IssuedMonth
          ).dates.find((dateInt) => dateInt.date === dateFormatted);
          if (actualDate) {
            extendedStudent.attendedHours = actualDate.hourAttended;
            extendedStudent.notAttendedHours = actualDate.hourToRecover;
          }
        }
      }
      return extendedStudent;
    });

    const parsedStudents: Student[] = [...dataFormatted];
    if (parsedStudents && this.groups) {
      parsedStudents.forEach((student) => {
        const group = this.groups.find((group) => group.id === student.group);
        if (group) {
          student.group = group.groupName;
        }
      });
    }
    return new MatTableDataSource<StudentTableRow>(dataFormatted);
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

  public addHoursToSelected(assisted: boolean): void {
    if (!this.selection.selected || this.selection.selected.length == 0) {
      this.openSnackBar('No hay elementos seleccionados');
      return;
    }

    this.selection.selected.forEach((selection) => {
      this.modifiedStudents.push(selection.id);
      const student = this.students.find(
        (student) => student.id === selection.id
      );
      if (student == undefined) {
        return;
      }

      const date: Date = new Date(
        formatDate(this.filterDate, `yyyy-MM-dd`, this.locale)
      );
      date.setHours(0, 0, 0, 0);

      const year = Number(format(date, 'yyyy'));
      const month = `m${format(date, 'MM').toLowerCase()}_${format(
        date,
        'MMMM'
      ).toLowerCase()}`;
      const dateFormatted: string = format(date, 'yyyy-MM-dd');

      if (!student.issued) {
        student.issued = [];
      }

      if (!student.issued?.map((issued) => issued.i_year).includes(year)) {
        const defaultMonth: IssuedMonth = {
          groupId: '',
          issuedState: IssuedMonthState.NotIssued,
          dates: [],
        };
        student.issued?.push({
          i_year: year,
          m01_january: { ...defaultMonth },
          m02_february: { ...defaultMonth },
          m03_march: { ...defaultMonth },
          m04_april: { ...defaultMonth },
          m05_may: { ...defaultMonth },
          m06_june: { ...defaultMonth },
          m07_july: { ...defaultMonth },
          m08_august: { ...defaultMonth },
          m09_september: { ...defaultMonth },
          m10_october: { ...defaultMonth },
          m11_november: { ...defaultMonth },
          m12_december: { ...defaultMonth },
        });
      }
      const actualYear: IssuedYear | undefined = student.issued.find(
        (issued) => issued.i_year === year
      );
      if (actualYear) {
        let actualDate: IssuedDate | undefined = (
          (actualYear as any)[month] as IssuedMonth
        ).dates.find((dateInt) => dateInt.date === dateFormatted);
        if (!actualDate) {
          actualDate = {
            date: dateFormatted,
            hourAttended: 0,
            hourToRecover: 0,
          };
          ((actualYear as any)[month] as IssuedMonth).dates.push(actualDate);
        }
        actualDate.hourAttended = assisted
          ? (actualDate.hourAttended += this.hoursToAdd)
          : actualDate.hourAttended;
        actualDate.hourToRecover = !assisted
          ? (actualDate.hourToRecover += this.hoursToAdd)
          : actualDate.hourToRecover;
        ((actualYear as any)[month] as IssuedMonth).dates.sort((a, b) =>
          a.date > b.date ? 1 : b.date > a.date ? -1 : 0
        );
      }
    });
    this.reloadTableData();
  }

  public saveHours(): void {
    this.studentsFirestoreInteraction.saveHours(
      this.students,
      this.modifiedStudents
    );
  }

  public reset(): void {
    this.filterReset$.next(true);
    this.students = [...{ ...this.studentsBackUp }];
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
    StudentsPageUtils.applyFilterToDataSource(
      this.dataSource,
      this.textFilter,
      [this.groupFilter]
    );
  }

  openSnackBar(message: string) {
    this.snackBar.open(message, '', {
      duration: 5000,
    });
  }

  getFiltersNoMatch(): string {
    return [this.textFilter]
      .filter((filters) => filters !== undefined)
      .join(', ');
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
}
