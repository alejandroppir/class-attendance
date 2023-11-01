import { MatPaginator } from '@angular/material/paginator';

import { GroupTableFilter } from './group-page.component';

export class GroupPageUtils {
 static tableFilter() {}

 static getTableFilterPredicate(): (data: any, filter: string) => boolean {
  return (data: any, filter: string) => {
   return GroupPageUtils.filter(filter, data);
  };
 }

 private static filter(filter: string, data: any) {
  const filterObject: Partial<GroupTableFilter> = JSON.parse(filter);
  const fText = filterObject.text || '';
  const textFilterValid: boolean = fText !== undefined && fText !== '';
  const emptyFilter: boolean = !textFilterValid;

  const textFilter: boolean =
   !textFilterValid || (textFilterValid && data['groupName'].toLowerCase().includes(fText.toLowerCase()));
  return emptyFilter || textFilter;
 }

 static applyFilterToDataSource(dataSource: any, textFilter: string) {
  const filterValue = textFilter;

  const filter: GroupTableFilter = {
   text: filterValue.trim(),
  };
  dataSource['filter'] = JSON.stringify(filter);

  if (dataSource['paginator']) {
   (dataSource['paginator'] as MatPaginator).firstPage();
  }
 }
}
