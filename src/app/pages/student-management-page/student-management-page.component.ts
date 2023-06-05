import { SelectionModel } from '@angular/cdk/collections';
import {
  AfterContentChecked,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { map, Observable, startWith, tap, concatMap, forkJoin } from 'rxjs';
import { Student, StudentUtils } from 'src/app/core/models/student.model';
import { FirestoreService } from 'src/app/core/services/firestore.service';

import { StudentsPageUtils } from '../students-page/students-page.utils';
import { Group } from 'c:/programmingSSD/class-attendance/src/app/core/models/groups.model';

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

  private readonly defaultHoursToAdvice = 20;

  //filters
  textFilter: string = '';
  groupChip: string[] = [];

  groups!: Group[];
  studentGroups!: Group[];

  constructor(
    private snackBar: MatSnackBar,
    private firestoreService: FirestoreService,
    private translate: TranslateService,
    private ref: ChangeDetectorRef
  ) {
    this.clearFields();
  }

  ngOnInit(): void {
    this.firestoreService
      .getStudents()
      .pipe(
        tap((students) => {
          this.students = students;
          this.reloadTableData();
        })
      )
      .subscribe((res) => this.parseGroups());

    this.firestoreService
      .getGroups()
      .pipe(
        tap((groups) => {
          this.groups = groups;
        })
      )
      .subscribe((res) => this.parseGroups());
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
    };
    this.studentGroups = [];
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

    const newSelectedGroups = [...this.studentGroups];
    this.parseGroups();
    const preSelectedGroups = [...this.studentGroups];
    const deletedGroups = preSelectedGroups.filter(
      (group) => !newSelectedGroups.map((group) => group.id).includes(group.id)
    );
    const addedGroups = newSelectedGroups.filter(
      (group) => !preSelectedGroups.map((group) => group.id).includes(group.id)
    );
    addedGroups.forEach((group) => group.students?.push(this.studentModel.id));
    deletedGroups.forEach(
      (group) =>
        (group.students = group.students?.filter(
          (student) => student !== this.studentModel.id
        ))
    );
    const groupsToEdit = [...addedGroups, ...deletedGroups];

    const operation =
      this.studentModel.id !== ''
        ? this.firestoreService.updateUserData(
            this.studentModel.id,
            this.studentModel
          )
        : this.firestoreService.addStudent({
            ...this.studentModel,
            id: StudentUtils.generateStudentId(),
          });
    operation
      .pipe(
        concatMap(() => {
          return forkJoin([
            groupsToEdit.map((group) =>
              this.firestoreService.updateGroupData(group.id, {
                students: group.students,
              })
            ),
          ]);
        })
      )
      .subscribe(() => {
        this.clearFields();
        this.openSnackBar(this.translate.instant('STUDENT_INSERTED'));
      });
  }

  editUser(student: Student): void {
    this.studentModel = { ...student };
    this.parseGroups();
  }

  deleteUser(student: Student): void {
    this.firestoreService.deleteUser(student.id).subscribe();
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

  deleteGroupFromList(group: Group): void {
    if (!this.studentGroups) {
      this.studentGroups = [];
    }
    this.studentGroups = this.studentGroups.filter(
      (studentGroup) => studentGroup !== group
    );
  }

  compareGroupFn(group1: Group, group2: Group) {
    return group1 && group2 ? group1.id === group2.id : group1 === group2;
  }

  private parseGroups(): void {
    if (this.studentModel.id === '') {
      this.studentGroups = [];
    } else {
      this.studentGroups = this.groups.filter((group) =>
        group.students?.includes(this.studentModel.id)
      );
    }
  }
}

// TODO - Validators
