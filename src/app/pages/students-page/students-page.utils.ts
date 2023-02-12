import { MatPaginator } from '@angular/material/paginator';
import { formatDate } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { Student, StudentDate } from 'src/app/core/models/student.model';
import { StudentTableRow, TableFilter } from './students-page.component';

export class StudentsPageUtils {
  static tableFilter() {}

  static getTableFilterPredicate(): (data: any, filter: string) => boolean {
    return (data: any, filter: string) => {
      return StudentsPageUtils.filter(filter, data);
    };
  }

  private static filter(filter: string, data: any) {
    const filterObject: Partial<TableFilter> = JSON.parse(filter);
    const fText = filterObject.text || '';
    const fGroup = filterObject.groups || [];
    const textFilterValid: boolean = fText !== undefined && fText !== '';
    const groupFilterValid: boolean = fGroup !== undefined && fGroup.length > 0;
    const emptyFilter: boolean = !textFilterValid && !groupFilterValid;

    const textFilter: boolean =
      !textFilterValid ||
      (textFilterValid &&
        (data['dni'].includes(fText) ||
          data['alias'].includes(fText) ||
          data['fullname'].includes(fText)));
    const groupFilter: boolean =
      !groupFilterValid ||
      (groupFilterValid &&
        data['groups'] !== undefined &&
        data['groups'].some((group: string) => fGroup?.includes(group)));
    return emptyFilter || (textFilter && groupFilter);
  }

  static applyFilterToDataSource(
    dataSource: any,
    textFilter: string,
    groupChip: string[]
  ) {
    const filterValue = textFilter;

    const filter: TableFilter = {
      text: filterValue.trim().toLowerCase(),
      groups: groupChip,
    };
    dataSource['filter'] = JSON.stringify(filter);

    if (dataSource['paginator']) {
      (dataSource['paginator'] as MatPaginator).firstPage();
    }
  }

  static findActualDate(
    dates: StudentDate[] | undefined,
    filterDate: Date,
    locale: string
  ): StudentDate | undefined {
    if (dates == undefined) {
      return;
    }
    return dates.find((date) => {
      const a = formatDate(date.date.toDate(), 'yyyy-MM-dd', locale);
      const b = formatDate(filterDate, 'yyyy-MM-dd', locale);
      return a === b;
    });
  }
}
