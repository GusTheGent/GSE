export interface Inspection {
  id: string;
  companyName: string;
  companyNumber: string;
  vehicleNumber: string
  inspectionDate: Date;
  fuelType: string
  result: string;
  engineer: string;
  approved: 0 | 1;
  isSynced: 0 | 1;
}
