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
 issued?: { [keys: number]: IssuedYear };
}

export class StudentUtils {
 public static generateStudentId(offset: number = 0): string {
  return `S-${(new Date().getTime() + offset).toString()}`;
 }

 public static addEmptyIssuedYear(student: Student, year: number): Student {
  if (!student.issued) {
   student.issued = {};
  }

  if (!student.issued?.hasOwnProperty(year)) {
   const defaultMonth: IssuedMonth = {
    issuedState: IssuedMonthState.NotIssued,
    dates: [],
   };
   student.issued[year] = {
    i_year: year,
    m01_january: JSON.parse(JSON.stringify(defaultMonth)),
    m02_february: JSON.parse(JSON.stringify(defaultMonth)),
    m03_march: JSON.parse(JSON.stringify(defaultMonth)),
    m04_april: JSON.parse(JSON.stringify(defaultMonth)),
    m05_may: JSON.parse(JSON.stringify(defaultMonth)),
    m06_june: JSON.parse(JSON.stringify(defaultMonth)),
    m07_july: JSON.parse(JSON.stringify(defaultMonth)),
    m08_august: JSON.parse(JSON.stringify(defaultMonth)),
    m09_september: JSON.parse(JSON.stringify(defaultMonth)),
    m10_october: JSON.parse(JSON.stringify(defaultMonth)),
    m11_november: JSON.parse(JSON.stringify(defaultMonth)),
    m12_december: JSON.parse(JSON.stringify(defaultMonth)),
   };
  }
  return student;
 }

 public static parseMonthProperty(month: string): string {
  switch (month) {
   case 'm01_january':
    return 'JAN_LABEL';
   case 'm02_february':
    return 'FEB_LABEL';
   case 'm03_march':
    return 'MAR_LABEL';
   case 'm04_april':
    return 'ABR_LABEL';
   case 'm05_may':
    return 'MAY_LABEL';
   case 'm06_june':
    return 'JUN_LABEL';
   case 'm07_july':
    return 'JUL_LABEL';
   case 'm08_august':
    return 'AGO_LABEL';
   case 'm09_september':
    return 'SEP_LABEL';
   case 'm10_october':
    return 'OCT_LABEL';
   case 'm11_november':
    return 'NOV_LABEL';
   case 'm12_december':
    return 'DEC_LABEL';

   default:
    return '';
  }
 }
}
