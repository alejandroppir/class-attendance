import { MatPaginator } from '@angular/material/paginator';

import { TableFilter } from './students-page.component';

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
          data['groupName'].includes(fText) ||
          data['fullname'].includes(fText)));

    const groupFilter: boolean =
      !groupFilterValid ||
      (groupFilterValid &&
        data['group'] !== undefined &&
        fGroup.includes(data['group']));
    return emptyFilter || (textFilter && groupFilter);
  }

  static applyFilterToDataSource(
    dataSource: any,
    textFilter: string,
    groups: string[]
  ) {
    const filterValue = textFilter;

    const filter: TableFilter = {
      text: filterValue.trim().toLowerCase(),
      groups: groups,
    };
    dataSource['filter'] = JSON.stringify(filter);

    if (dataSource['paginator']) {
      (dataSource['paginator'] as MatPaginator).firstPage();
    }
  }
}
