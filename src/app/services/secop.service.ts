import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RespuestaApi } from '../models/alerta.model';

@Injectable({
  providedIn: 'root'
})
export class SecopService {
  // private apiUrl = 'https://secop-radar-api.onrender.com/api/alertas';
  private apiUrl = 'http://localhost:8000/api/alertas';

  constructor(private http: HttpClient) { }

  ejecutarMotorRiesgo(filtros: any): Observable<RespuestaApi> {
    let params = new HttpParams();

    Object.keys(filtros).forEach(key => {
      if (filtros[key] !== null && filtros[key] !== '') {
        params = params.append(key, filtros[key]);
      }
    });

    return this.http.get<RespuestaApi>(this.apiUrl, { params });
  }
}