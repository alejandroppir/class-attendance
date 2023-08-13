import { Timestamp } from '@angular/fire/firestore';

export enum Months {
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
}

export interface IssuedMonth {
  month: Months;
  groupId: string;
  issued: boolean;
}

export interface Student {
  id: string;
  alias: string;
  fullname: string;
  dni: string;
  telephone: number;
  email: string;
  address: string;
  issuedMonths?: IssuedMonth[];
}

export class StudentUtils {
  public static generateStudentId(): string {
    return `S-${new Date().getTime().toString()}`;
  }
}
