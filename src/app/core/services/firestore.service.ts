import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { UserCredential } from 'firebase/auth';
import { concatMap, Observable, take } from 'rxjs';
import { FSConstants } from '../constants/firestore-collections.constants';
import { Student } from '../models/student.model';

// import { AppConfigStrg } from '../models/app-config.models';
// import { FSConstants } from './../constants/firestore-collections.constants';
// import { DriveUploadedFile, DriveUploadedFileStrg } from './../models/drive-image.models';
// import { FnFImage } from './../models/fnf-images.models';
// import { UserStrg } from './../models/user.models';
import {
  DocData,
  FirestoreConnectorService,
} from './firestore-connector.service';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService extends FirestoreConnectorService {
  studentsCollection = FSConstants.STUDENTS;
  //  fnfImagesCollection = FSConstants.FF_IMAGES;
  //  appConfigCollection = FSConstants.APP_CONFIG;
  //  usageStatsCollection = FSConstants.USAGE_STATS;

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
    return this.getCollectionData(this.studentsCollection) as Observable<
      Student[]
    >;
  }
  addStudent(student: Student): Observable<void> {
    return this.setDoc(this.studentsCollection, student.id, student).pipe(
      take(1)
    );
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

  //  // Users
  //  addUser(user: UserStrg): Observable<void> {
  //   return this.setDoc(this.usersCollection, user.alias, user).pipe(take(1));
  //  }

  //  getUsernames(): Observable<UserStrg[]> {
  //   return this.getCollectionData(this.usersCollection) as Observable<UserStrg[]>;
  //  }

  //  getUserDataByUid(uid: string): Observable<UserStrg | null> {
  //   return this.getUserData(where('uid', '==', uid));
  //  }

  //  getUserDataByAlias(alias: string): Observable<UserStrg | null> {
  //   return this.getUserData(where('alias', '==', alias));
  //  }

  //  getUserData(where: QueryConstraint): Observable<UserStrg | null> {
  //   return (this.getCollectionData(this.usersCollection, [where]) as Observable<UserStrg[]>).pipe(
  //    map((users) => {
  //     if (users && users.length >= 0) {
  //      return users[0];
  //     }
  //     return null;
  //    }),
  //   );
  //  }

  //  updateUserData(userDocName: string, dataToUpdate: {}): Observable<void> {
  //   return this.updateDoc(this.usersCollection, userDocName, dataToUpdate);
  //  }

  //  deleteUser(userDocName: string): Observable<unknown> {
  //   return this.deleteDoc(`${this.usersCollection}`, userDocName).pipe(
  //    concatMap(() => this.deleteCollection(`${this.usersCollection}/${userDocName}/${FSConstants.USER_IMAGES}`)),
  //   );
  //  }

  //  // UNUSED
  //  renameUser(oldDocName: string, newDocName: string) {
  //   return this.renameDoc(this.usersCollection, oldDocName, newDocName);
  //  }

  //  // User images
  //  addUrl(userDocName: string, image: DriveUploadedFile): Observable<void> {
  //   return this.setDoc(`${this.usersCollection}/${userDocName}/${FSConstants.USER_IMAGES}`, image.id, { image });
  //  }

  //  getImages(userDocName: string): Observable<DriveUploadedFileStrg[]> {
  //   return this.getCollectionData(`${this.usersCollection}/${userDocName}/${FSConstants.USER_IMAGES}`) as Observable<DriveUploadedFileStrg[]>;
  //  }

  //  updateUrlMessage(userDocName: string, imageId: string, message: string): Observable<void> {
  //   return this.updateDoc(`${this.usersCollection}/${userDocName}/${FSConstants.USER_IMAGES}`, imageId, { message });
  //  }

  //  deleteUrl(userDocName: string, docName: string): Observable<void> {
  //   return this.deleteDoc(`${this.usersCollection}/${userDocName}/${FSConstants.USER_IMAGES}`, docName);
  //  }

  //  // Users disabled
  //  addDisabledUser(userAlias: string, oldUid: string, newUid: string = ''): Observable<void> {
  //   return this.setDoc(FSConstants.USERS_TO_DISABLE, oldUid, {
  //    actionToDo: 'Delete the username with this uid and then delete this doc',
  //    reason: newUid === '' ? 'This user was deleted' : `This user change to "${newUid}"`,
  //    userAlias: userAlias,
  //   });
  //  }

  //  // FnF Image Methods
  //  setselectedImageForUser(userDocName: string, image: FnFImage): Observable<void> {
  //   return this.setDoc(this.fnfImagesCollection, userDocName, image);
  //  }

  //  getSelectedImageForUser(userId: string): Observable<FnFImage> {
  //   return this.getDocData(this.fnfImagesCollection, userId) as unknown as Observable<FnFImage>;
  //  }

  //  getSelectedImages(): Observable<FnFImage[]> {
  //   return this.getCollectionData(this.fnfImagesCollection) as Observable<FnFImage[]>;
  //  }

  //  deleteImageForUser(userDocName: string): Observable<void> {
  //   return this.deleteDoc(this.fnfImagesCollection, userDocName);
  //  }

  //  // UNUSED
  //  renameUserImages(oldDocName: string, newDocName: string): Observable<unknown> {
  //   return this.renameDoc(this.fnfImagesCollection, oldDocName, newDocName, [FSConstants.USER_IMAGES]);
  //  }

  //  // app config
  //  getAppConfig(): Observable<AppConfigStrg> {
  //   return this.getDocData(this.appConfigCollection, FSConstants.APP_CONFIG) as unknown as Observable<AppConfigStrg>;
  //  }

  //  updateConfig(dataToUpdate: {}): Observable<void> {
  //   return this.updateDoc(this.appConfigCollection, this.appConfigCollection, dataToUpdate);
  //  }

  //  // Log
  //  logAction(docIdentifier: string, dataToUpdate: {}): Observable<void> {
  //   const date = new Date().toISOString().split('T')[0];
  //   return this.setDoc(`${this.usageStatsCollection}/${date}/${docIdentifier}`, `${Date.now()}`, dataToUpdate);
  //  }
}

// /**
//  * Utils:
//  * serverTimestamp() en un field mete el tiempo del servidor
//  * deleteField() en un field elimina ese field
//  */
