import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { NetworkService } from '../../../shared/services/network.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Inspection } from '../../../shared/interfaces/Inspection';
import { DbService } from '../../../shared/services/db.service';
import { forkJoin, from, Observable, Subscription } from 'rxjs';
import { ApiService } from '../../../shared/services/api.service';
import { liveQuery } from 'dexie';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit, OnDestroy{

  private networkService = inject(NetworkService);
  private dbService = inject(DbService);
  private apiService = inject(ApiService);
  private networkSubscription: Subscription;
  private dbServiceSubscription: Subscription;
  private postInspectionSubscription: Subscription;

  public unsyncedInspections: Inspection[] = [];
  public isOnline: boolean;
  public isSyncing: boolean = false;

  public unsyncedInspections$: Observable<Inspection[]> = from(liveQuery<Inspection[]>(() => this.dbService.getUnsyncedInspections()))

  ngOnInit(): void {
    this.dbServiceSubscription = this.unsyncedInspections$.subscribe((unsynced) => {
      this.unsyncedInspections = unsynced;
    })
    this.networkSubscription = this.networkService.isOnline.subscribe((online) => {
      this.isOnline = online
      if(this.isOnline && this.unsyncedInspections.length > 0) {
        this.onSync();
      }
    })
    this.apiService.getUser().subscribe((user) => {
      console.log(user);
    })
    this.apiService.getVehicles().subscribe((vehicles) => {
      this.dbService.storeVehicles(vehicles);
    })
  }

  public onSync(): void {
    if (this.unsyncedInspections.length === 0) {
      return;
    }

    this.isSyncing = true;
    const syncObservables = this.unsyncedInspections.map((inspection) =>
      this.apiService.postInspection(inspection)
    );

    this.postInspectionSubscription = forkJoin(syncObservables).subscribe({
      next: (results) => {
        results.forEach((result, index) => {
          const inspection = this.unsyncedInspections[index];
          console.log(['SYNCED: '], inspection);
          this.dbService.syncInspectionLocally(inspection);
        });
        this.isSyncing = false;
      },
      error: (err) => {
        console.error('Sync error:', err);
        this.isSyncing = false;
      },
    });
  }

  ngOnDestroy(): void {
      this.networkSubscription.unsubscribe();
      this.dbServiceSubscription.unsubscribe();
      if(this.postInspectionSubscription) this.postInspectionSubscription.unsubscribe();
  }

}
