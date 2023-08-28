import { SelectionModel } from '@angular/cdk/collections';
import {
  AfterContentChecked,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { Group } from 'c:/programmingSSD/class-attendance/src/app/core/models/groups.model';
import { tap } from 'rxjs';
import { Student, StudentUtils } from 'src/app/core/models/student.model';
import { FirestoreService } from 'src/app/core/services/firestore.service';

import { StudentsPageUtils } from '../students-page/students-page.utils';

interface StudentManagementTableRow extends Student {
  groupName: string;
}

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
  displayedColumns: string[] = ['fullname', 'dni', 'groupName', 'buttons'];
  dataSource = this.loadTableData();
  selection = new SelectionModel<StudentManagementTableRow>(true, []);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  paginatorSize: number[] = [5, 10, 25, 100];
  @ViewChild(MatSort) sort!: MatSort;

  //filters
  textFilter: string = '';
  groupFilter: string = '';
  groups!: Group[];

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
      .subscribe();

    this.firestoreService
      .getGroups()
      .pipe(
        tap((groups) => {
          this.groups = groups.filter((group) => group.enabled);
          this.reloadTableData();
        })
      )
      .subscribe();
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
      group: '',
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
    delete (this.studentModel as any)['groupName'];
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
    operation.subscribe(() => {
      this.clearFields();
      this.openSnackBar(this.translate.instant('STUDENT_INSERTED'));
    });
  }

  editUser(student: Student): void {
    this.studentModel = { ...student };
    this.reloadTableData();
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
      [this.groupFilter]
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

  private loadTableData(): MatTableDataSource<StudentManagementTableRow> {
    const parsedStudents: StudentManagementTableRow[] = this.students.map(
      (student) => {
        const studentInt: StudentManagementTableRow = {
          ...student,
          groupName: '',
        };
        if (this.groups) {
          const group = this.groups.find((group) => group.id === student.group);
          if (group) {
            studentInt.groupName = group.groupName;
          }
        }
        return studentInt;
      }
    );
    return new MatTableDataSource<StudentManagementTableRow>(parsedStudents);
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
    return [this.textFilter]
      .filter((filters) => filters !== undefined)
      .join(', ');
  }

  compareGroupFn(group1: string, group2: string) {
    return group1 && group2 ? group1 === group2 : group1 === group2;
  }

  log() {
    console.log(this.studentModel);
  }
}
