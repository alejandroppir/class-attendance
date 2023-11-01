import { Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { UserCredential } from 'firebase/auth';
import { Observable, take } from 'rxjs';

import { FSConstants } from '../constants/firestore-collections.constants';
import { Group } from '../models/groups.model';
import { Student } from '../models/student.model';
import { DocData, FirestoreConnectorService } from './firestore-connector.service';
import { Helper } from '../models/helpers.model';

@Injectable({
 providedIn: 'root',
})
export class FirestoreService extends FirestoreConnectorService {
 studentsCollection = FSConstants.STUDENTS;
 groupsCollection = FSConstants.GROUPS;
 helpersCollection = FSConstants.HELPERS;

 constructor(protected firestore: Firestore, protected authenticator: Auth) {
  super(firestore, authenticator);
 }

 // Auth
 login(user: string, pass: string): Observable<UserCredential> {
  return this.signIn(user, pass);
 }

 logout(): Observable<void> {
  return this.signOut();
 }

 register(user: string, pass: string): Observable<UserCredential> {
  return this.createUser(user, pass);
 }

 // Students
 getStudents(): Observable<Student[]> {
  return this.getCollectionData(this.studentsCollection) as Observable<Student[]>;
 }
 addStudent(student: Student): Observable<void> {
  return this.setDoc(this.studentsCollection, student.id, student).pipe(take(1));
 }

 updateUserData(userDocName: string, dataToUpdate: {}): Observable<void> {
  return this.updateDoc(this.studentsCollection, userDocName, dataToUpdate);
 }

 deleteUser(userDocName: string): Observable<unknown> {
  return this.deleteDoc(`${this.studentsCollection}`, userDocName);
 }

 updateMultipleStudents(docArray: DocData[]): Observable<void> {
  return this.updateBatch(this.studentsCollection, docArray);
 }

 //Groups
 getGroups(): Observable<Group[]> {
  return this.getCollectionData(this.groupsCollection) as Observable<Group[]>;
 }

 addGroup(group: Group): Observable<void> {
  return this.setDoc(this.groupsCollection, group.id, group).pipe(take(1));
 }

 updateGroupData(groupDocName: string, dataToUpdate: {}): Observable<void> {
  return this.updateDoc(this.groupsCollection, groupDocName, dataToUpdate);
 }

 deleteGroup(groupDocName: string): Observable<unknown> {
  return this.deleteDoc(`${this.groupsCollection}`, groupDocName);
 }

 getHelpers(): Observable<Helper[]> {
  return this.getCollectionData(this.helpersCollection) as Observable<Helper[]>;
 }

 addHelper(helperId: string, helper: Helper): Observable<void> {
  return this.setDoc(this.helpersCollection, helperId, helper).pipe(take(1));
 }
}

// /**
//  * Utils:
//  * serverTimestamp() en un field mete el tiempo del servidor
//  * deleteField() en un field elimina ese field
//  */
