import { map, Observable, startWith, take, tap } from 'rxjs';
import {
  Component,
  OnInit,
  ViewChild,
  AfterContentChecked,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormGroupDirective,
  Validators,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { Student } from 'src/app/core/models/student.model';
import { FirestoreService } from 'src/app/core/services/firestore.service';
import { NgForm } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { StudentsPageUtils } from '../students-page/students-page.utils';

@Component({
  selector: 'app-student-management-page',
  templateUrl: './student-management-page.component.html',
  styleUrls: ['./student-management-page.component.scss'],
})
export class StudentManagementPageComponent
  implements OnInit, AfterContentChecked, AfterViewInit
{
  studentModel!: Student;
  students: Student[] = [];

  //students table
  displayedColumns: string[] = ['fullname', 'dni', 'buttons'];
  dataSource = this.loadTableData();
  selection = new SelectionModel<Student>(true, []);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  paginatorSize: number[] = [5, 10, 25, 100];
  @ViewChild(MatSort) sort!: MatSort;

  // Filter
  filterControl = new FormControl('');
  options: string[] = [];
  filteredOptions: Observable<string[]>;

  private readonly defaultHoursToAdvice = 20;

  //filters
  textFilter: string = '';
  groupChip: string[] = [];

  constructor(
    private snackBar: MatSnackBar,
    private firestoreService: FirestoreService,
    private translate: TranslateService,
    private ref: ChangeDetectorRef
  ) {
    this.clearFields();
    this.filteredOptions = this.filterControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value || ''))
    );
  }

  ngOnInit(): void {
    this.firestoreService
      .getStudents()
      .pipe(
        tap((students) => {
          this.students = students;
          this.reloadTableData();
          this.initFilterValues(students);
        })
      )
      .subscribe();
  }

  private initFilterValues(students: Student[]): void {
    const groups: string[] = students
      .filter((student) => student.groups !== undefined)
      .map((student) => student.groups as string[])
      .flat();
    this.options = [...new Set(groups)];
    this.filterControl.updateValueAndValidity({
      onlySelf: false,
      emitEvent: true,
    });
  }

  clearFields(): void {
    this.studentModel = {
      id: '',
      alias: '',
      fullname: '',
      dni: '',
      telephone: 0,
      email: '',
      address: '',
      hoursToAdvice: this.defaultHoursToAdvice,
      groups: [],
    };
  }

  saveUser(): void {
    if (
      !this.studentModel ||
      !this.studentModel.alias ||
      !this.studentModel.fullname ||
      !this.studentModel.dni
    ) {
      this.openSnackBar(this.translate.instant('FORM_FIELDS_INVALID'));
      return;
    }
    if (
      this.studentModel.id === '' &&
      this.students
        .map((student) => student.alias)
        .some((studentAlias) => studentAlias === this.studentModel.alias)
    ) {
      this.openSnackBar(this.translate.instant('ALIAS ALREADY_EXIST'));
      return;
    }
    const operation =
      this.studentModel.id !== ''
        ? this.firestoreService.updateUserData(
            this.studentModel.id,
            this.studentModel
          )
        : this.firestoreService.addStudent({
            ...this.studentModel,
            id: new Date().getTime().toString(),
          });
    operation.subscribe(() => {
      this.clearFields();
      this.filterControl.reset();
      this.openSnackBar(this.translate.instant('STUDENT_INSERTED'));
    });
  }

  editUser(student: Student): void {
    this.studentModel = { ...student };
  }

  deleteUser(student: Student): void {
    this.firestoreService.deleteUser(student.id).subscribe();
  }

  addGroupToList() {
    if (this.filterControl.value) {
      if (!this.studentModel.groups) {
        this.studentModel.groups = [];
      }
      this.studentModel.groups.push(this.filterControl.value);
      this.studentModel.groups = [...new Set(this.studentModel.groups)];
      this.filterControl.reset();
    }
  }

  deleteGroupFromList(group: string): void {
    if (!this.studentModel.groups) {
      this.studentModel.groups = [];
    }
    this.studentModel.groups = this.studentModel.groups.filter(
      (student) => student !== group
    );
  }

  openSnackBar(message: string) {
    this.snackBar.open(message, '', {
      duration: 5000,
    });
  }

  // Table
  applyFilter() {
    StudentsPageUtils.applyFilterToDataSource(
      this.dataSource,
      this.textFilter,
      this.groupChip
    );
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

  private loadTableData(): MatTableDataSource<Student> {
    return new MatTableDataSource<Student>(this.students);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.options.filter((option) =>
      option.toLowerCase().includes(filterValue)
    );
  }

  textFilterChange(textFilter: string): void {
    this.textFilter = textFilter;
    this.applyFilter();
  }

  chipsFilterChange(chips: string[]): void {
    this.groupChip = chips;
    this.applyFilter();
  }

  getFiltersNoMatch(): string {
    return [this.textFilter, this.groupChip]
      .filter((filters) => filters !== undefined)
      .join(', ');
  }
}

// TODO - Validators
