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
import { Timestamp } from '@angular/fire/firestore';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { BehaviorSubject, map, Observable, startWith, tap } from 'rxjs';
import { DocData } from 'src/app/core/services/firestore-connector.service';
import { FirestoreService } from 'src/app/core/services/firestore.service';
import { MatChipInputEvent } from '@angular/material/chips';
import { Student, StudentDate } from '../../core/models/student.model';
import { FormControl } from '@angular/forms';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { ElementRef } from '@angular/core';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { StudentsPageUtils } from './students-page.utils';
import { StudentsFirestoreInteractionService } from './students-firestore-interaction.service';

export interface StudentTableRow extends Student {
  id: string;
  fullname: string;
  dni: string;
  telephone: number;
  email: string;
  address: string;
  date: StudentDate;
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
  filteredList: Student[] = [];
  hoursToAdd: number = 0;
  filterDate: Date = new Date();

  //students table
  dateFormat: string = 'yyyy-MM-dd';
  displayedColumns: string[] = ['select', 'fullname', 'dni', 'hours'];
  dataSource = this.loadTableData();
  selection = new SelectionModel<StudentTableRow>(true, []);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  paginatorSize: number[] = [5, 10, 25, 100];
  @ViewChild(MatSort) sort!: MatSort;

  modifiedStudents: string[] = [];

  textFilter: string = '';
  groupChip: string[] = [];

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
      let dateRet = {
        date: Timestamp.fromDate(
          new Date(this.filterDate.toISOString().split('T')[0])
        ),
        hours: 0,
        issuedHours: 0,
      };
      if (this.filterDate) {
        const date = StudentsPageUtils.findActualDate(
          student.dates,
          this.filterDate,
          this.locale
        );
        dateRet = date ? date : dateRet;
      }
      return { ...student, date: dateRet };
    });
    return new MatTableDataSource<StudentTableRow>(dataFormatted);
  }

  public modifyHours(sign: number): void {
    if (!this.hoursToAdd) {
      this.hoursToAdd = 0;
    }
    this.hoursToAdd = this.hoursToAdd + 1 * sign;
    if (this.hoursToAdd < 0) {
      this.hoursToAdd = 0;
    }
  }

  public addHoursToSelected(): void {
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
      const date = StudentsPageUtils.findActualDate(
        student.dates,
        this.filterDate,
        this.locale
      );
      if (date) {
        date.hours += this.hoursToAdd;
      } else {
        if (!student.dates) {
          student.dates = [];
        }
        const date: Date = new Date(
          formatDate(this.filterDate, 'yyyy-MM-dd', this.locale)
        );
        date.setHours(0, 0, 0, 0);
        student.dates?.push({
          date: Timestamp.fromDate(date),
          hours: this.hoursToAdd,
          issuedHours: 0,
        });
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
      this.groupChip
    );
  }

  openSnackBar(message: string) {
    this.snackBar.open(message, '', {
      duration: 5000,
    });
  }

  getFiltersNoMatch(): string {
    return [this.textFilter, this.groupChip]
      .filter((filters) => filters !== undefined)
      .join(', ');
  }

  chipsFilterChange(chips: string[]): void {
    this.groupChip = chips;
    this.applyFilter();
  }

  textFilterChange(textFilter: string): void {
    this.textFilter = textFilter;
    this.applyFilter();
  }
}
