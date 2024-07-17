import { Routes } from '@angular/router';
import { CreateComponent } from './features/inspections/create/create.component';
import { InspectionsComponent } from './features/inspections/inspections.component';
import { EngineersComponent } from './features/engineers/engineers.component';
import { EditComponent } from './features/inspections/edit/edit.component';
import { VehiclesComponent } from './features/vehicles/vehicles.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'inspections',
    pathMatch: 'full',
  },
  {
    path: 'inspections',
    component: InspectionsComponent,
  },
  {
    path: 'inspections/create',
    component: CreateComponent,
  },
  {
    path: 'inspections/edit/:id',
    component: EditComponent,
  },
  {
    path: 'engineers',
    component: EngineersComponent,
  },
  {
    path: 'vehicles',
    component: VehiclesComponent,
  },
];
