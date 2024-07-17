import { Component, inject } from '@angular/core';
import { DbService } from '../../shared/services/db.service';
import { from, Observable } from 'rxjs';
import { Vehicle } from '../../shared/interfaces/Vehicle';
import { liveQuery } from 'dexie';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-vehicles',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vehicles.component.html',
  styleUrl: './vehicles.component.scss'
})
export class VehiclesComponent {
  private dbService = inject(DbService);
  public vehicles$: Observable<Vehicle[]> = from(liveQuery<Vehicle[]>(() => this.dbService.getAllVehicles()));
}
