import { Injectable } from '@angular/core';
import { Subject, interval, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import {ServerStatusService} from "../services/server-status.service";

@Injectable({
  providedIn: 'root'
})
export class PollingService {
  private stopPolling$ = new Subject<void>();
  public isServerReady$ = new BehaviorSubject<boolean>(false);

  private loadingToastId: number | null = null;

  constructor(
    private serverStatusService: ServerStatusService,
    private toastr: ToastrService
  ) {}

  startPolling() {
    this.loadingToastId = this.toastr.info('Awaiting backend connection, please wait', 'Loading', {
      disableTimeOut: true,
      closeButton: true
    }).toastId;

    interval(5000)
      .pipe(
        switchMap(() => this.serverStatusService.checkServerStatus()),
        takeUntil(this.stopPolling$),
        catchError(error => {
          this.toastr.error('Failed to connect to the backend.', 'Error');
          this.stopPolling$.next();
          return throwError(() => new Error(error));
        })
      )
      .subscribe(isReady => {
        if (isReady) {
          this.isServerReady$.next(true);
          if (this.loadingToastId !== null) {
            this.toastr.clear(this.loadingToastId);
          }
          this.toastr.success('Backend is ready', 'Success');
          this.stopPolling$.next();
        }
      });
  }

  setServerState(serverState: boolean) {
    this.isServerReady$.next(serverState);
  }

  stopPolling() {
    if (this.loadingToastId !== null) {
      this.toastr.clear(this.loadingToastId);
    }
    this.stopPolling$.next();
    this.stopPolling$.complete();
  }
}
