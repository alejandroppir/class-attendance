import { SelectionModel } from '@angular/cdk/collections';
import {
  AfterContentChecked,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { tap } from 'rxjs';
import { Student } from 'src/app/core/models/student.model';
import { FirestoreService } from 'src/app/core/services/firestore.service';
import { StudentsPageUtils } from '../students-page/students-page.utils';
import { InputHoursDialogComponent } from './input-hours-dialog/input-hours-dialog.component';

export interface InvoicingStudentsTableRow extends Student {
  id: string;
  fullname: string;
  dni: string;
  telephone: number;
  email: string;
  address: string;
  invoicedHours: number;
  notInvoicedHours: number;
  totalHours: number;
}

@Component({
  selector: 'app-invoicing-page',
  templateUrl: './invoicing-page.component.html',
  styleUrls: ['./invoicing-page.component.scss'],
})
export class InvoicingPageComponent
  implements OnInit, AfterContentChecked, AfterViewInit
{
  studentModel!: Student;
  students: Student[] = [];

  //students table
  displayedColumns: string[] = [
    'fullname',
    'dni',
    'notInvoicedHours',
    'hoursResume',
  ];
  dataSource = this.loadTableData();
  selection = new SelectionModel<InvoicingStudentsTableRow>(true, []);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  paginatorSize: number[] = [5, 10, 25, 100];
  @ViewChild(MatSort) sort!: MatSort;

  //filters
  textFilter: string = '';
  groupChip: string[] = [];

  constructor(
    private snackBar: MatSnackBar,
    private firestoreService: FirestoreService,
    private ref: ChangeDetectorRef,
    public dialog: MatDialog,
    private translate: TranslateService
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
  }

  clearFields(): void {
    // TODO - limpiar los campos
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

  private loadTableData(): MatTableDataSource<InvoicingStudentsTableRow> {
    const dataFormatted = this.students.map((student) => {
      let invoicedHours = 0;
      let totalHours = 0;
      if (student.dates) {
        student.dates.forEach((element) => {
          invoicedHours = invoicedHours + element.issuedHours;
          totalHours = totalHours + element.hours;
        });
      }
      return {
        ...student,
        notInvoicedHours: totalHours - invoicedHours,
        invoicedHours: invoicedHours,
        totalHours: totalHours,
      };
    });
    dataFormatted.sort((a, b) => a.notInvoicedHours - b.notInvoicedHours);
    return new MatTableDataSource<InvoicingStudentsTableRow>(dataFormatted);
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

  openDialog(element: InvoicingStudentsTableRow): void {
    const dialogRef = this.dialog.open(InputHoursDialogComponent, {
      data: { studentName: element.fullname, hours: element.hoursToAdvice },
    });

    dialogRef.afterClosed().subscribe((hoursToInvoice: number) => {
      if (hoursToInvoice !== undefined) {
        this.openSnackBar(this.translate.instant('INVOICING'));
        this.invoiceHours(element, hoursToInvoice);
      }
    });
  }

  private invoiceHours(
    student: InvoicingStudentsTableRow,
    hoursToInvoice: number
  ): void {
    if (student.dates) {
      let hoursToInvoiceRemaining = +hoursToInvoice;
      const availableDates = student.dates.filter(
        (date) => date.issuedHours < date.hours
      );
      const freeHours = availableDates.reduce(
        (partialSum, date) => partialSum + (date.hours - date.issuedHours),
        0
      );
      if (freeHours >= hoursToInvoiceRemaining) {
        for (let date of availableDates.sort(
          (a, b) => a.date.toMillis() - b.date.toMillis()
        )) {
          if (hoursToInvoiceRemaining === 0) {
            break;
          }
          const hoursAvailables = date.hours - date.issuedHours;
          const hoursToInvoiceIteration = Math.min(
            hoursAvailables,
            hoursToInvoiceRemaining
          );
          date.issuedHours = date.issuedHours + hoursToInvoiceIteration;
          hoursToInvoiceRemaining =
            hoursToInvoiceRemaining - hoursToInvoiceIteration;
        }
        this.firestoreService
          .updateUserData(student.id, student)
          .subscribe(() => {
            console.log('correcto');
          });
        return;
      }
    }
    this.openSnackBar(this.translate.instant('NOT_ENOUGH_HOURS'));
  }
}

// si bajas las horas a menos de lo que tngas en invoice. quitas las horas que se pasen y las redistribuyes
