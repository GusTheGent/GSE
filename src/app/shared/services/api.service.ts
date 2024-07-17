import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { AZURE_ENDPOINTS, ENDPOINTS } from '../endpoints/endpoints';
import { Observable } from 'rxjs';
import { Inspection } from '../interfaces/Inspection';
import { Vehicle } from '../interfaces/Vehicle';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private http = inject(HttpClient);

  // postInspection(inspection: Inspection): Observable<any> {
  //   return this.http.post<Observable<any>>(`http://localhost:3000/inspection`, inspection);
  // }

  postInspection(inspection: Inspection): Observable<any> {
    return this.http.post<Observable<any>>(`${ENDPOINTS.BASE_URL}/${ENDPOINTS.POSTS}`, inspection);
  }

  getUser(): Observable<{id: number, email: string, role: string}> {
    const params = new HttpParams().set('email', 'kaggelis@inttrust.gr');
    return this.http.get<{id: number, email: string, role: string}>(`${AZURE_ENDPOINTS.BASE_URL}/${AZURE_ENDPOINTS.USER}`, {
      params: params
    })
  }


  getVehicles(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(`${AZURE_ENDPOINTS.BASE_URL}/${AZURE_ENDPOINTS.VEHICLES}`);
  }


  getFakeUsers(): Observable<any> {
    return this.http.get<any>('http://localhost:3000/users');
  }

  getDummyVehicles(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>('http://localhost:3000/vehicles');
  }


}

