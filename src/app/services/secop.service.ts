import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FiltrosMotor, RespuestaApi } from '../models/alerta.model';

@Injectable({
  providedIn: 'root'
})
export class SecopService {
  // private apiUrl = 'https://secop-radar-api.onrender.com/api/alertas';
  private apiUrl = 'http://localhost:8000/api/alertas';

  constructor(private http: HttpClient) { }

  ejecutarMotorRiesgo(filtros: FiltrosMotor, apiKey: string): Observable<RespuestaApi> {
      let params = new HttpParams();

      Object.keys(filtros).forEach(key => {
        if (filtros[key] !== null && filtros[key] !== '') {
          params = params.append(key, filtros[key]);
        }
      });

      // Inyectamos la llave que el usuario escribió en el formulario
      const headers = new HttpHeaders({
        'api-key': apiKey
      });

      return this.http.get<RespuestaApi>(this.apiUrl, { params, headers });
  }
}