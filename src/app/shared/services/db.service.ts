import { Injectable } from '@angular/core';
import { IndexedDatabase } from '../database/db';
import { Inspection } from '../interfaces/Inspection';
import { Vehicle } from '../interfaces/Vehicle';
import { User } from '../interfaces/User';

@Injectable({
  providedIn: 'root',
})
export class DbService {
  private db = new IndexedDatabase();

  constructor() {}

  public async syncInspectionLocally(
    selectedInspection: Inspection
  ): Promise<void> {
    await this.db.syncInspectionLocally(selectedInspection);
  }

  public async addInspection(inspection: Inspection): Promise<void> {
    await this.db.addInspection(inspection)
  }

  public async getInspectionById(id: number): Promise<Partial<Inspection | undefined>> {
    return await this.db.getInspectionById(id);
  }

  public async updateInspection(recordId: number, updatedInspection: Inspection) {
    await this.db.updateInspection(recordId, updatedInspection);
  }

  public async getUnsyncedInspections(): Promise<Inspection[]> {
    return await this.db.getUnsyncedInspections();
  }

  public async getInspections(): Promise<Inspection[]>{
    return await this.db.getInspections();
  }

  public async deleteInspection(selectedInspection: Inspection): Promise<void> {
    return await this.db.deleteInspection(selectedInspection);
  }

  public async storeVehicles(vehicles: Vehicle[]): Promise<void> {
    return await this.db.addVehicles(vehicles);
  }

  public async getAllVehicles(): Promise<Vehicle[]> {
    return await this.db.getAllVehicles();
  }

  public async getUniqueCompanies(): Promise<{ companyId: number, companyName: string, companyNumber: string }[]> {
    const vehicles = await this.getAllVehicles() as Vehicle[];
    const uniqueCompanies = Array.from(new Set(vehicles.map(vehicle => vehicle.companyId)))
      .map(id => {
        const vehicle = vehicles.find(v => v.companyId === id);
        return { companyId: id, companyName: vehicle?.companyName || '', companyNumber: vehicle?.companyNumber || '' };
      });
    return uniqueCompanies;
  }

  public async getVehiclesByCompanyId(companyId: number): Promise<Vehicle[]> {
    return await this.db.getVehiclesByCompanyId(companyId);
  }

  public async getEngineers(): Promise<User[]> {
    return await this.db.getAllUsers();
  }

  // public async floodFakeUsers(users: any[]): Promise<void> {
  //   return await this.db.floodFakeUsers(users);
  // }
}
