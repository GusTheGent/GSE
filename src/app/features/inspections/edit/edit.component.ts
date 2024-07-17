import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DbService } from '../../../shared/services/db.service';
import { CommonModule } from '@angular/common';
import { Inspection } from '../../../shared/interfaces/Inspection';
import { NetworkService } from '../../../shared/services/network.service';
import { EMPTY, Subscription, switchMap, tap } from 'rxjs';
import { ApiService } from '../../../shared/services/api.service';
import { Vehicle } from '../../../shared/interfaces/Vehicle';
import { User } from '../../../shared/interfaces/User';
import { IndexedDatabase } from '../../../shared/database/db';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgSelectModule],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.scss',
})
export class EditComponent implements OnInit, OnDestroy {
  private db = new IndexedDatabase();
  private activatedRoute = inject(ActivatedRoute);
  private networkService = inject(NetworkService);
  private apiService = inject(ApiService);
  private dbService = inject(DbService);
  private router = inject(Router);
  private inspectionId: number;
  private networkSubscription: Subscription;
  private company:{companyId: number, companyName: string, companyNumber: string};

  public engineers: User[] = [];
  public companies: {companyId: number, companyName: string, companyNumber: string}[] = [];
  public vehicles: Vehicle[] = [];

  public inspectionForm = new FormGroup({
    companyName: new FormControl<string>('', Validators.required),
    companyNumber: new FormControl<string>('', Validators.required),
    vehicleNumber: new FormControl<string>('', Validators.required),
    inspectionDate: new FormControl<Date>(new Date(0), Validators.required),
    fuelType: new FormControl<string>('', Validators.required),
    result: new FormControl<string>('', Validators.required),
    engineer: new FormControl<string>('', Validators.required),
    approved: new FormControl<number>(0, Validators.required),
  });

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe((params) => {
      this.inspectionId = +params.get('id')!;
      this.loadInspection();
    });

    this.db.getAllUsers().then((engineers) => {
      this.engineers = engineers;
    });

    this.dbService.getUniqueCompanies().then((companies) => {
      this.companies = companies;
    })

    this.inspectionForm.get('companyName')?.valueChanges.subscribe((companyId) => {
      this.onCompanyChange(companyId!);
    });
  }


  onCompanyChange(companyId: string | number): void {
    if (companyId) {
      const selectedCompany = this.companies.find(company => company.companyId === Number(companyId));
      if (selectedCompany) {
        this.inspectionForm.patchValue({ companyNumber: selectedCompany.companyNumber });
        this.inspectionForm.patchValue({ vehicleNumber: null });
      }
      this.dbService.getVehiclesByCompanyId(Number(companyId)).then((vehicles) => {
        this.vehicles = vehicles;
      });
    } else {
      this.vehicles = [];
      this.inspectionForm.patchValue({ companyNumber: '' });
    }
  }

  private async loadInspection(): Promise<void> {
    await this.dbService
      .getInspectionById(this.inspectionId)
      .then((inspection) => {
        this.inspectionForm.patchValue(inspection as Inspection);
      });
  }

  public onUpdate(): void {
    const inspectionValue = this.inspectionForm.value as Inspection;

    this.networkSubscription = this.networkService.isOnline.pipe(
      switchMap((isOnline: boolean) => {
        if (isOnline) {
          return this.apiService.postInspection(inspectionValue).pipe(
            tap(() => {
              this.dbService.updateInspection(this.inspectionId, {...inspectionValue, isSynced: 1});
            })
          );
        } else {
          this.dbService.updateInspection(this.inspectionId, {...inspectionValue, isSynced: 0});
          this.inspectionForm.reset();
          this.router.navigate(['/inspections']);
          return EMPTY;
        }
      })
    ).subscribe(() => {
      this.inspectionForm.reset();
      this.router.navigate(['/inspections']);
    });
  }

  ngOnDestroy(): void {
      if(this.networkSubscription) this.networkSubscription.unsubscribe();
  }
}
