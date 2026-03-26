import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { apiUrl } from '../utils/apiUrl';

@Injectable({
  providedIn: 'root'
})
export class RadarService {

  private url = apiUrl;

  constructor(private http: HttpClient) { }

  obtenerAlertas(params: any, apiKey: string): Observable<any> {
    const headers = new HttpHeaders().set('x-api-key', apiKey);
    return this.http.get(`${this.url}/alertas`, { headers, params });
  }

  obtenerRedForense(idContrato: string): Observable<any> {
    return this.http.get(`${this.url}/alertas/forense/contrato/${idContrato}`);
  }

  subirArchivoPEP(archivo: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', archivo);
    return this.http.post(`${this.url}/alertas/forense/cargar-pep`, formData);
  }
}