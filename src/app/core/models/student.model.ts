/* export enum Months {
  January = 'JAN',
  February = 'FEB',
  March = 'MAR',
  April = 'APR',
  May = 'MAY',
  June = 'JUN',
  July = 'JUL',
  August = 'AUG',
  September = 'SEP',
  October = 'OCT',
  November = 'NOV',
  December = 'DEC',
} */

export enum IssuedMonthState {
  Issued = 'ISSUED',
  NotIssued = 'NOT_ISSUED',
  NotNeeded = 'NOT_NEEDED',
}

export enum IssuedHourType {
  Attend = 'ATTEND',
  NotAttend = 'NOT_ATTEND',
}

export interface IssuedYear {
  i_year: number;
  //month: IssuedMonth[];
  m01_january: IssuedMonth;
  m02_february: IssuedMonth;
  m03_march: IssuedMonth;
  m04_april: IssuedMonth;
  m05_may: IssuedMonth;
  m06_june: IssuedMonth;
  m07_july: IssuedMonth;
  m08_august: IssuedMonth;
  m09_september: IssuedMonth;
  m10_october: IssuedMonth;
  m11_november: IssuedMonth;
  m12_december: IssuedMonth;
}

export interface IssuedMonth {
  //month: Months;
  groupId: string;
  issuedState: IssuedMonthState;
  dates: IssuedDate[];
}

export interface IssuedDate {
  date: string;
  hourAttended: number;
  hourToRecover: number;
}

export interface Student {
  id: string;
  alias: string;
  fullname: string;
  dni: string;
  telephone: number;
  email: string;
  address: string;
  group: string;
  issued?: IssuedYear[];
}

export class StudentUtils {
  public static generateStudentId(): string {
    return `S-${new Date().getTime().toString()}`;
  }
}
