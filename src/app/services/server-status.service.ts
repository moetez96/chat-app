import { Injectable } from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {map, Observable} from "rxjs";
import {catchError} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class ServerStatusService {

  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  checkServerStatus(): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}status/isReady`).pipe(
      map(response => response),
      catchError(() => {
        return [false];
      })
    );
  }
}
