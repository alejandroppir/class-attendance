import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { tap } from 'rxjs';

import { Group } from '../../../../core/models/groups.model';
import { FirestoreService } from '../../../../core/services/firestore.service';

@Component({
 selector: 'app-text-filter',
 templateUrl: './text-filter.component.html',
 styleUrls: ['./text-filter.component.scss'],
})
export class TextFilterComponent implements OnInit {
 @Input() onlyTextFilter: boolean = false;
 @Output() textFilterChange = new EventEmitter<string>();
 @Output() groupFilterChange = new EventEmitter<string>();
 textFilter: string = '';
 selectedGroup: string = '';
 groups!: Group[];

 constructor(private firestoreService: FirestoreService) {}
 ngOnInit(): void {
  this.firestoreService
   .getGroups()
   .pipe(
    tap((groups) => {
     const emptyGroup = {
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
     this.groups = [emptyGroup, ...groups.filter((group) => group.enabled)];
    }),
   )
   .subscribe();
 }

 applyFilterText(): void {
  this.textFilterChange.emit(this.textFilter);
 }

 applyFilterGroup(): void {
  this.groupFilterChange.emit(this.selectedGroup);
 }

 compareGroupFn(group1: string, group2: string) {
  return group1 && group2 ? group1 === group2 : group1 === group2;
 }
}
