import { SelectionModel } from '@angular/cdk/collections';
import { formatDate } from '@angular/common';
import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Timestamp } from 'firebase/firestore';
import { Student } from 'src/app/core/models/student.model';
import { DocData } from 'src/app/core/services/firestore-connector.service';
import { FirestoreService } from 'src/app/core/services/firestore.service';
import { StudentTableRow } from './students-page.component';
import { StudentsPageUtils } from './students-page.utils';

@Injectable({
  providedIn: 'root',
})
export class StudentsFirestoreInteractionService {
  constructor(private firestoreService: FirestoreService) {}

  public saveHours(students: Student[], modifiedStudents: string[]): void {
    const modStudents: string[] = [...new Set(modifiedStudents)];
    const studentsDataArray = modStudents
      .map((studentId) => {
        const student = students.find((student) => student.id === studentId);
        return student
          ? ({ docName: student.id, dataToUpdate: { ...student } } as DocData)
          : undefined;
      })
      .filter((data) => data !== undefined);

    this.firestoreService.updateMultipleStudents(
      studentsDataArray as DocData[]
    );
  }
}
