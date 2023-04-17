import { Timestamp } from '@angular/fire/firestore';

export interface StudentDate {
  date: Timestamp;
  hours: number;
  issuedHours: number;
}

export interface Student {
  id: string;
  alias: string;
  fullname: string;
  dni: string;
  telephone: number;
  email: string;
  address: string;
  dates?: StudentDate[];
  groups?: string[];
  hoursToAdvice: number;
}

export class StudentUtils {
  public static generateStudentId(): string {
    return `S-${new Date().getTime().toString()}`;
  }
}
