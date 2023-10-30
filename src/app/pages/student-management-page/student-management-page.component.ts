import { SelectionModel } from '@angular/cdk/collections';
import { AfterContentChecked, AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { Observable, delay, forkJoin, tap } from 'rxjs';
import { Student, StudentUtils } from 'src/app/core/models/student.model';
import { FirestoreService } from 'src/app/core/services/firestore.service';

import { StudentsPageUtils } from '../students-page/students-page.utils';
import { Group } from '../../core/models/groups.model';

interface StudentManagementTableRow extends Student {
 groupName: string;
}

@Component({
 selector: 'app-student-management-page',
 templateUrl: './student-management-page.component.html',
 styleUrls: ['./student-management-page.component.scss'],
})
export class StudentManagementPageComponent implements OnInit, AfterContentChecked, AfterViewInit {
 studentModel!: Student;
 studentModelGroups: string[] = [];
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
  private ref: ChangeDetectorRef,
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
  this.studentModelGroups = [];
 }

 saveUser(): void {
  if (!this.studentModel || !this.studentModel.alias || !this.studentModel.fullname || !this.studentModel.dni) {
   this.openSnackBar(this.translate.instant('FORM_FIELDS_INVALID'));
   return;
  }
  if (
   this.studentModel.id === '' &&
   this.students.map((student) => student.dni).some((studentDNI) => studentDNI === this.studentModel.dni)
  ) {
   this.openSnackBar(this.translate.instant('DNI_GROUP_ALREADY_EXIST'));
   return;
  }
  delete (this.studentModel as any)['groupName'];
  const operations: Observable<unknown>[] = [];
  if (this.studentModel.id === '') {
   this.studentModelGroups.forEach((group, index) => {
    operations.push(
     this.firestoreService.addStudent({
      ...this.studentModel,
      id: StudentUtils.generateStudentId(index),
      issued: {},
      group,
     }),
    );
   });
  } else {
   const baseStudentGroups = this.students
    .filter((studentElement) => studentElement.dni === this.studentModel.dni)
    .map((studentElement) => studentElement.group);

   const updated = this.studentModelGroups.filter((item) => baseStudentGroups.includes(item));
   const newGroups = this.studentModelGroups.filter((item) => !baseStudentGroups.includes(item));
   const deleted = baseStudentGroups.filter((item) => !this.studentModelGroups.includes(item));

   const findStudentByDniAndGroup = (group: string): Student | undefined =>
    this.students.find((student) => student.dni === this.studentModel.dni && student.group === group);

   updated.forEach((group) => {
    const student = findStudentByDniAndGroup(group);
    if (student) {
     operations.push(this.firestoreService.updateUserData(student.id, { ...this.studentModel, id: student.id, group }));
    }
   });
   newGroups.forEach((group, index) => {
    operations.push(
     this.firestoreService.addStudent({
      ...this.studentModel,
      issued: {},
      id: StudentUtils.generateStudentId(index),
      group,
     }),
    );
   });
   deleted.forEach((group) => {
    const student = findStudentByDniAndGroup(group);
    if (student) {
     operations.push(this.firestoreService.deleteUser(student.id));
    }
   });
  }

  forkJoin(operations).subscribe(() => {
   this.clearFields();
   this.openSnackBar(this.translate.instant('STUDENT_INSERTED'));
  });
 }

 editUser(student: Student): void {
  this.studentModel = { ...student };
  const groups = this.students
   .filter((studentElement) => studentElement.dni === student.dni)
   .map((studentElement) => studentElement.group);
  this.studentModelGroups = [...groups];
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
  StudentsPageUtils.applyFilterToDataSource(this.dataSource, this.textFilter, [this.groupFilter]);
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

 private loadTableData(): MatTableDataSource<StudentManagementTableRow> {
  const parsedStudents: StudentManagementTableRow[] = this.students.map((student) => {
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
  });
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
  return [this.textFilter].filter((filters) => filters !== undefined).join(', ');
 }

 compareGroupFn(group1: string, group2: string) {
  return group1 && group2 ? group1 === group2 : group1 === group2;
 }
}
