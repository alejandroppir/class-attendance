import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Student } from 'src/app/core/models/student.model';
import { DocData } from 'src/app/core/services/firestore-connector.service';
import { FirestoreService } from 'src/app/core/services/firestore.service';

@Injectable({
 providedIn: 'root',
})
export class StudentsFirestoreInteractionService {
 constructor(private firestoreService: FirestoreService) {}

 public saveHours(students: Student[], modifiedStudents: string[]): Observable<void> {
  const modStudents: string[] = [...new Set(modifiedStudents)];
  const studentsDataArray = modStudents
   .map((studentId) => {
    const student = students.find((student) => student.id === studentId);
    delete (student as any)['groupName'];
    delete (student as any)['attendedHours'];
    delete (student as any)['notAttendedHours'];
    delete (student as any)['hasNotAttendedHours'];

    return student ? ({ docName: student.id, dataToUpdate: { ...student } } as DocData) : undefined;
   })
   .filter((data) => data !== undefined);

  return this.firestoreService.updateMultipleStudents(studentsDataArray as DocData[]);
 }
}
