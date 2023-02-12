import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-text-filter',
  templateUrl: './text-filter.component.html',
  styleUrls: ['./text-filter.component.scss'],
})
export class TextFilterComponent {
  @Output() textFilterChange = new EventEmitter<string>();
  textFilter: string = '';

  constructor() {}

  applyFilter() {
    this.textFilterChange.emit(this.textFilter);
  }
}
