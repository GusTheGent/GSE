import { Dexie, Table } from 'dexie';
import { Inspection } from '../interfaces/Inspection';
import { User } from '../interfaces/User';
import { Vehicle } from '../interfaces/Vehicle';
import { engineers } from '../helper/engineers';

export class IndexedDatabase extends Dexie {
  private INSPECTIONS: Table<Partial<Inspection>>;
  private ENGINEERS: Table<any>;
  private VEHICLES: Table<Vehicle>;

  constructor() {
    super('OFFLINE_DB');
    this.version(2).stores({
      INSPECTIONS: '++id, companyName, companyNumber, vehicleNumber, inspectionDate, fuelType, result, engineer, approved, isSynced',
      VEHICLES: '++id, companyId',
      ENGINEERS: '++id',
    });

    this.on('populate', () => {
      this.addInitialUsers();
    });
  }

  /**
   * @returns {Promise<Inspection[]>}
   */

  public async getInspections(): Promise<Inspection[]> {
    return await this.table('INSPECTIONS').toArray() as Inspection[];
  }

  /**
   * @param id
   * @returns {Promise<Partial<Inspection> | undefined>}
   */

  public async getInspectionById(id: number): Promise<Partial<Inspection | undefined>> {
    return await this.INSPECTIONS
    .where('id')
    .equals(id)
    .first();
  }

  /**
   * @param updatedInspection
   * @returns {Promise<number>}
   */
  public async updateInspection(recordId:number, updatedInspection: Inspection): Promise<number> {
    return await this.INSPECTIONS.where({id: recordId}).modify(updatedInspection)
  }

  /**
   * @param inpectionValue
   * @returns {Promise<void>}
   */

  public async addInspection(inpectionValue: Partial<Inspection>): Promise<void> {
    return await this.INSPECTIONS.add(inpectionValue);
  }

  /**
   * @param selectedInpection
   * @returns {Promise<void>}
   */

  public async deleteInspection(selectedInpection: Inspection): Promise<void> {
    return await this.INSPECTIONS.delete(selectedInpection.id);
  }

  /**
   * @param selectedInspection
   * @returns {Promise<void>}
   */

  async syncInspectionLocally(selectedInspection: Inspection): Promise<void> {
    const inspectionToUpdate = await this.INSPECTIONS.get(
      selectedInspection.id
    );
    if (inspectionToUpdate) {
      inspectionToUpdate.isSynced = 1;
      await this.INSPECTIONS.update(selectedInspection.id, inspectionToUpdate);
    } else {
      throw new Error(`Inspection with id ${selectedInspection.id} not found.`);
    }
  }

  /**
   * @returns {Promise<Inspection[]>}
   */

  public async getUnsyncedInspections(): Promise<Inspection[]> {
    return await this.INSPECTIONS
    .where('isSynced')
    .equals(0)
    .toArray() as Inspection[];
  }

  /**
   * @returns {Promise<User[]>}
   */

  async getAllUsers(): Promise<User[]> {
    return this.ENGINEERS.toArray();
  }
  /**
   * @param user
   */
  async addUser(user: User): Promise<void> {
    await this.ENGINEERS.add(user);
  }
  /**
   * @param userId
   */
  async deleteUser(userId: string): Promise<void> {
    await this.ENGINEERS.delete(userId);
  }

  private async addInitialUsers(): Promise<void> {
    return await this.ENGINEERS.bulkAdd(engineers);
  }

  // public async floodFakeUsers(fakeUsers: {userId: string, firstName: string, lastName: string}[]): Promise<void> {
  //   return await this.ENGINEERS.bulkAdd(fakeUsers);
  // }


  public async addVehicles(vehicles: Vehicle[]): Promise<void> {
    // const existingIds = await this.getAllVehicles();
    // const existingIdSet = new Set(existingIds.map(v => v.id));
    // const vehiclesToAdd = vehicles.filter(v => !existingIdSet.has(v.id));
    await this.dropVehicles();
    return await this.VEHICLES.bulkAdd(vehicles);
  }

  public async getAllVehicles(): Promise<Vehicle[]> {
    return await this.VEHICLES.toArray();
  }

  private async dropVehicles(): Promise<void> {
    return await this.VEHICLES.clear()
  }

  public async getVehiclesByCompanyId(companyId: number): Promise<Vehicle[]> {
    return await this.VEHICLES.where('companyId').equals(companyId).toArray() as Vehicle[];
  }
}
