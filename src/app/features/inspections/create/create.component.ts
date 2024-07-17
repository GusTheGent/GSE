import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { IndexedDatabase } from '../../../shared/database/db';
import { Router } from '@angular/router';
import { User } from '../../../shared/interfaces/User';
import { NetworkService } from '../../../shared/services/network.service';
import {  EMPTY, Subscription, switchMap, tap } from 'rxjs';
import { Inspection } from '../../../shared/interfaces/Inspection';
import { ApiService } from '../../../shared/services/api.service';
import { DbService } from '../../../shared/services/db.service';
import { Vehicle } from '../../../shared/interfaces/Vehicle';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgSelectModule],
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss',
})
export class CreateComponent implements OnInit, OnDestroy {
  private db = new IndexedDatabase();
  private router = inject(Router);
  private networkService = inject(NetworkService);
  private apiService = inject(ApiService);
  private dbService = inject(DbService);
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

  constructor() {}

  ngOnInit(): void {
    this.dbService.getEngineers().then((engineers) => {
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
        this.company = selectedCompany;
        this.inspectionForm.patchValue({ companyNumber: selectedCompany.companyNumber });
      }
      this.dbService.getVehiclesByCompanyId(Number(companyId)).then((vehicles) => {
        this.vehicles = vehicles;
      });
    } else {
      this.vehicles = [];
      this.inspectionForm.patchValue({ companyNumber: '' });
    }
  }

  onSubmit(): void {
    const inspectionValue = this.inspectionForm.value as Inspection;

    this.networkSubscription = this.networkService.isOnline.pipe(
      switchMap((isOnline: boolean) => {
        if (isOnline) {
          return this.apiService.postInspection(inspectionValue).pipe(
            tap(() => {
              this.dbService.addInspection({...inspectionValue, isSynced: 1});
            })
          );
        } else {
          this.dbService.addInspection({...inspectionValue, isSynced: 0});
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
    if (this.networkSubscription) this.networkSubscription.unsubscribe();
  }
}
