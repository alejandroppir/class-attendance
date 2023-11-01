import { SelectionModel } from '@angular/cdk/collections';
import { AfterContentChecked, AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { map, Observable, startWith, tap } from 'rxjs';
import { FirestoreService } from 'src/app/core/services/firestore.service';

import { Group, GroupDayShift, GroupUtils } from '../../core/models/groups.model';
import { GroupPageUtils } from './group-page.utils';

export interface GroupTableFilter {
 text: string;
}

@Component({
 selector: 'app-group-page',
 templateUrl: './group-page.component.html',
 styleUrls: ['./group-page.component.scss'],
})
export class GroupPageComponent implements OnInit, AfterContentChecked, AfterViewInit {
 groupModel!: Group;
 groups: Group[] = [];

 displayedColumns: string[] = [
  'groupName',
  'price',
  'enabled',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
  'buttons',
 ];

 dataSource = this.loadTableData();
 selection = new SelectionModel<Group>(true, []);
 @ViewChild(MatPaginator) paginator!: MatPaginator;
 paginatorSize: number[] = [5, 10, 25, 100];
 @ViewChild(MatSort) sort!: MatSort;

 // Filter
 filterControl = new FormControl('');
 options: string[] = [];
 filteredOptions: Observable<string[]>;
 textFilter: string = '';

 constructor(
  private snackBar: MatSnackBar,
  private firestoreService: FirestoreService,
  private translate: TranslateService,
  private ref: ChangeDetectorRef,
 ) {
  this.clearFields();
  this.filteredOptions = this.filterControl.valueChanges.pipe(
   startWith(''),
   map((value) => this._filter(value || '')),
  );
 }

 ngOnInit(): void {
  this.firestoreService
   .getGroups()
   .pipe(
    tap((groups) => {
     this.groups = groups;
     this.reloadTableData();
    }),
   )
   .subscribe();
 }

 clearFields(): void {
  this.groupModel = {
   id: '',
   groupName: '',
   price: 0,
   monday: { initHour: 0, endHour: 0 },
   wednesday: { initHour: 0, endHour: 0 },
   tuesday: { initHour: 0, endHour: 0 },
   thursday: { initHour: 0, endHour: 0 },
   friday: { initHour: 0, endHour: 0 },
   saturday: { initHour: 0, endHour: 0 },
   sunday: { initHour: 0, endHour: 0 },
   enabled: true,
  };
 }

 saveGroup(): void {
  if (!this.groupModel || !this.groupModel.groupName) {
   this.openSnackBar(this.translate.instant('FORM_FIELDS_INVALID'));
   return;
  }
  if (
   this.groupModel.id === '' &&
   this.groups.map((group) => group.groupName).some((groupName) => groupName === this.groupModel.groupName)
  ) {
   this.openSnackBar(this.translate.instant('GROUP_NAME ALREADY_EXIST'));
   return;
  }

  const operation =
   this.groupModel.id !== ''
    ? this.firestoreService.updateGroupData(this.groupModel.id, this.groupModel)
    : this.firestoreService.addGroup({
       ...this.groupModel,
       id: GroupUtils.generateGroupId(),
      });
  operation.subscribe(() => {
   this.clearFields();
   this.filterControl.reset();
   this.openSnackBar(this.translate.instant('GROUP_INSERTED'));
  });
 }

 editGroup(group: Group): void {
  this.groupModel = { ...group };
 }

 deleteGroup(group: Group): void {
  this.firestoreService.deleteGroup(group.id).subscribe();
 }

 openSnackBar(message: string) {
  this.snackBar.open(message, '', {
   duration: 5000,
  });
 }

 // Table
 applyFilter() {
  GroupPageUtils.applyFilterToDataSource(this.dataSource, this.textFilter);
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
  this.dataSource.filterPredicate = GroupPageUtils.getTableFilterPredicate();
  this.selection.clear();
 }

 private loadTableData(): MatTableDataSource<Group> {
  return new MatTableDataSource<Group>(this.groups);
 }

 private _filter(value: string): string[] {
  const filterValue = value.toLowerCase();

  return this.options.filter((option) => option.toLowerCase().includes(filterValue));
 }

 textFilterChange(textFilter: string): void {
  this.textFilter = textFilter;
  this.applyFilter();
 }

 public getFiltersNoMatch(): string {
  return [this.textFilter].filter((filters) => filters !== undefined).join(', ');
 }

 updateEndHour(day: GroupDayShift) {
  if (day.initHour >= day.endHour) {
   if (day.initHour === 24) {
    day.endHour = day.initHour;
   } else {
    day.endHour = day.initHour + 0.5;
   }
  }
  return day.endHour;
 }

 updateStartHour(day: GroupDayShift) {
  if (day.endHour <= day.initHour) {
   if (day.initHour === 0) {
    day.initHour = day.endHour;
   } else {
    day.initHour = day.endHour - 0.5;
   }
  }
 }
}
