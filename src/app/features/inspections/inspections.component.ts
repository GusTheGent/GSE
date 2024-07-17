import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Inspection } from '../../shared/interfaces/Inspection';
import { Router, RouterLink } from '@angular/router';
import { from, Observable } from 'rxjs';
import { DbService } from '../../shared/services/db.service';
import { liveQuery } from 'dexie';
import { ApiService } from '../../shared/services/api.service';

@Component({
  selector: 'app-inspections',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './inspections.component.html',
  styleUrl: './inspections.component.scss',
})
export class InspectionsComponent implements OnInit{
  private dbService = inject(DbService);
  private apiService = inject(ApiService)
  private router = inject(Router);


  ngOnInit(): void {
      // this.apiService.getDummyVehicles().subscribe((v) => {
      //   console.log(v);
      // })
  }


  public inspections$: Observable<Inspection[]> = from(
    liveQuery<Inspection[]>(() => this.dbService.getInspections())
  );

  public async onDelete(inspection: Inspection): Promise<void> {
    await this.dbService.deleteInspection(inspection).then(() => {
      alert(`Record ${inspection.companyName} Deleted!`);
    });
  }

  public onEdit(inspectionId: string): void {
    this.router.navigate([`inspections/edit/${inspectionId}`]);
  }
}
