import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { apiUrl } from '../utils/apiUrl';

@Injectable({
  providedIn: 'root'
})
export class RadarService {

  private url = apiUrl;

  constructor(private http: HttpClient) { }

  obtenerRedForense(idContrato: string): Observable<any> {
    return this.http.get(`${this.url}/forense/contrato/${idContrato}`);
  }

  subirArchivoPEP(archivo: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', archivo);
    return this.http.post(`${this.url}/alertas/forense/cargar-pep`, formData);
  }
}
