import { COMMA, ENTER } from '@angular/cdk/keycodes';
import {
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { map, Observable, startWith } from 'rxjs';
import { FirestoreService } from 'src/app/core/services/firestore.service';

@Component({
  selector: 'app-chip-filter',
  templateUrl: './chip-filter.component.html',
  styleUrls: ['./chip-filter.component.scss'],
})
export class ChipFilterComponent implements OnInit {
  @Output() chipChange = new EventEmitter<string[]>();

  separatorKeysCodes: number[] = [ENTER, COMMA];
  chipControl = new FormControl();
  filteredGroups: Observable<string[]>;
  groupChip: string[] = [];
  allGroups: string[] = [];

  @ViewChild('chipInput') chipInput!: ElementRef<HTMLInputElement>;

  constructor(private firestoreService: FirestoreService) {
    this.getGroups();
    this.filteredGroups = this.chipControl.valueChanges.pipe(
      startWith(null),
      map((group: string | null) =>
        group ? this._filter(group) : this.allGroups.slice()
      )
    );
    this.initFilterValues();
  }

  ngOnInit(): void {}

  private initFilterValues(): void {
    this.chipControl.updateValueAndValidity({
      onlySelf: false,
      emitEvent: true,
    });
  }

  private getGroups() {
    this.firestoreService.getStudents().subscribe((students) => {
      this.allGroups = [
        ...new Set(
          students
            .map((student) => student.groups)
            .flat()
            .filter((student) => student !== undefined)
        ),
      ] as string[];
      this.initFilterValues();
    });
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      this.groupChip.push(value);
    }
    event.chipInput!.clear();

    this.chipControl.setValue(null);
    this.postChipChange();
  }

  remove(group: string): void {
    const index = this.groupChip.indexOf(group);
    if (index >= 0) {
      this.groupChip.splice(index, 1);
    }
    this.postChipChange();
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.groupChip.push(event.option.viewValue);
    this.groupChip = [...new Set(this.groupChip)];
    this.chipInput.nativeElement.value = '';
    this.chipControl.setValue(null);
    this.postChipChange();
  }

  private _filter(value: string): string[] {
    return this.allGroups.filter((group) =>
      group.toLowerCase().includes(value.toLowerCase())
    );
  }

  postChipChange(): void {
    this.chipChange.emit(this.groupChip);
  }
}
