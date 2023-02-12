import { Injectable } from '@angular/core';

@Injectable({
 providedIn: 'root',
})
export class LocalStorageService {
 LOCAL_STORAGE_EMPTY_FOR_TAG = 'LOCAL_STORAGE_EMPTY_FOR_TAG';
 constructor() {
  //Empty
 }

 public put(tag: string, itemToSave: unknown): void {
  localStorage.setItem(tag, JSON.stringify(itemToSave));
 }

 public get(tag: string): unknown {
  return localStorage.getItem(tag) !== undefined && localStorage.getItem(tag) !== null ? JSON.parse(localStorage.getItem(tag) || '{}') : undefined;
 }

 public delete(tag: string): void {
  localStorage.removeItem(tag);
 }

 public getFromLS<T>(lsVariable: string): T {
  if (this.get(lsVariable)) {
   return this.get(lsVariable) as T;
  }
  return {} as T;
 }

 public clear(): void {
  localStorage.clear();
 }
}
