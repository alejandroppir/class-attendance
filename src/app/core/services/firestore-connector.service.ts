import { Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  UserCredential,
} from '@angular/fire/auth';
import {
  addDoc as addDocFire,
  collection,
  collectionData,
  collectionSnapshots,
  deleteDoc as deleteDocFire,
  doc,
  docData,
  DocumentData,
  DocumentReference,
  Firestore,
  query,
  QueryConstraint,
  serverTimestamp,
  setDoc as setDocFire,
  updateDoc as updateDocFire,
  writeBatch,
} from '@angular/fire/firestore';
import { concatMap, forkJoin, from, Observable, of, take, tap } from 'rxjs';

export interface DocData {
  docName: string;
  dataToUpdate: {};
}

@Injectable({
  providedIn: 'root',
})
export class FirestoreConnectorService {
  constructor(private store: Firestore, private auth: Auth) {}

  // Auth
  protected signIn(user: string, pass: string): Observable<UserCredential> {
    return from(signInWithEmailAndPassword(this.auth, user, pass));
  }

  protected signOut(): Observable<void> {
    return from(signOut(this.auth));
  }

  protected createUser(user: string, pass: string): Observable<UserCredential> {
    return from(createUserWithEmailAndPassword(this.auth, user, pass));
  }

  // DDBB
  protected addDoc(
    storePath: string,
    data: {}
  ): Observable<DocumentReference<DocumentData>> {
    const collectionReference = collection(this.store, storePath);
    return from(
      addDocFire(collectionReference, { ...data, timestamp: serverTimestamp() })
    );
  }

  protected setDoc(
    collectionName: string,
    docName: string,
    data: {},
    options = { merge: true }
  ): Observable<void> {
    const docReference = doc(this.store, collectionName, docName);
    return from(
      setDocFire(
        docReference,
        { ...data, timestamp: serverTimestamp() },
        options
      )
    );
  }

  protected updateDoc(
    collectionName: string,
    docName: string,
    dataToUpdate: {}
  ): Observable<void> {
    const docReference = doc(this.store, collectionName, docName);
    return from(
      updateDocFire(docReference, {
        ...dataToUpdate,
        timestamp: serverTimestamp(),
      })
    );
  }

  protected updateBatch(collectionName: string, docArray: DocData[]) {
    // Get a new write batch
    const batch = writeBatch(this.store);

    docArray.forEach((docData) => {
      const sfRef = doc(this.store, collectionName, docData.docName);
      batch.update(sfRef, { ...docData.dataToUpdate });
    });
    return from(batch.commit());
  }

  protected renameDoc(
    collectionName: string,
    oldDocName: string,
    newDocName: string,
    subCollections: string[] = []
  ): Observable<unknown> {
    const oldDocReference = doc(this.store, collectionName, oldDocName);
    const subCollectionsObs = subCollections.map((subCollection) =>
      collectionData(
        collection(
          this.store,
          `${collectionName}/${oldDocName}/${subCollection}`
        )
      ).pipe(
        tap((documentData) => {
          documentData.forEach((document) =>
            this.addDoc(
              `${collectionName}/${newDocName}/${subCollection}`,
              document
            )
          );
        })
      )
    );
    return docData(oldDocReference).pipe(
      take(1),
      concatMap((fireDoc) => this.setDoc(collectionName, newDocName, fireDoc)),
      concatMap(() => forkJoin(subCollectionsObs)),
      concatMap(() => this.deleteDoc(collectionName, oldDocName))
    );
  }

  protected deleteDoc(storePath: string, docName: string): Observable<void> {
    const storePathRef = doc(this.store, `${storePath}/${docName}`);
    return from(deleteDocFire(storePathRef));
  }

  /** Mucho cuidado con este metodo, puede eliminar todo si no se pasa bien la coleccion */
  protected deleteCollection(storePath: string): Observable<unknown> {
    const storePathRef = collection(this.store, storePath);
    return collectionSnapshots(storePathRef).pipe(
      concatMap((querySnapshot) => {
        return of(
          querySnapshot.map((doc) => {
            this.deleteDoc(storePath, doc.id);
          })
        );
      })
    );
  }

  protected getCollectionData(
    storePath: string,
    queryConstraints: QueryConstraint[] = []
  ): Observable<unknown[]> {
    const storePathRef = collection(this.store, storePath);
    const queryWithConstraints = query(storePathRef, ...queryConstraints);
    return collectionData(queryWithConstraints) as Observable<unknown[]>;
  }

  protected getDocData(
    storePath: string,
    docName: string
  ): Observable<unknown[]> {
    const storePathRef = doc(this.store, `${storePath}/${docName}`);
    return docData(storePathRef) as Observable<unknown[]>;
  }
}

/**
 * Utils:
 * serverTimestamp() en un field mete el tiempo del servidor
 * deleteField() en un field elimina ese field
 */
