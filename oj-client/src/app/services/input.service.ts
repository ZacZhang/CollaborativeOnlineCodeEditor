import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Observable} from "rxjs/Rx";

@Injectable()
export class InputService {

  private inputSubject$ = new BehaviorSubject<string>('');

  constructor() { }

  // setter
  changeInput(term) {
    this.inputSubject$.next(term);
  }

  // getter
  getInput(): Observable<string> {
    return this.inputSubject$.asObservable();
  }

}
