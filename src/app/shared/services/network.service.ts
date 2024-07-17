import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {

  private onlineStatus: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(navigator.onLine);

  constructor() {
    window.addEventListener('online', () => this.updateOnlineStatus(true));
    window.addEventListener('offline', () => this.updateOnlineStatus(false));
  }

  private updateOnlineStatus(isOnline: boolean): void {
    this.onlineStatus.next(isOnline);
  }

  get isOnline(): Observable<boolean> {
    return this.onlineStatus.asObservable();
  }

  get currentOnlineStatus(): boolean {
    return this.onlineStatus.getValue();
  }
}
