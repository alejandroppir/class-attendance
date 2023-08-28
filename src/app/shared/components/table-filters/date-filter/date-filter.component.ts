import {
  Component,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatInput } from '@angular/material/input';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-date-filter',
  templateUrl: './date-filter.component.html',
  styleUrls: ['./date-filter.component.scss'],
})
export class DateFilterComponent implements OnInit {
  @Input() reset!: Observable<boolean>;
  @Input() initialDate: Date = new Date();
  @Output() dateEmitter = new EventEmitter<Date>();

  @ViewChild('dateInput', {
    read: MatInput,
  })
  dateInput!: MatInput;

  filterControl = new FormControl('');

  constructor(
    private _adapter: DateAdapter<any>,
    @Inject(MAT_DATE_LOCALE) private _locale: string
  ) {
    this._locale = 'es';
    this._adapter.setLocale(this._locale);
  }

  ngOnInit(): void {
    this.reset.subscribe(() => {
      this.filterControl.reset();
      if (this.dateInput) {
        this.dateInput.value = '';
      }
    });
  }

  dateChange(event: any): void {
    this.dateEmitter.emit(event.value);
  }
}
