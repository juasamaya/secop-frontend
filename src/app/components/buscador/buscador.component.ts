import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Obligatorio para ngIf, ngFor y pipes
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SecopService } from '../../services/secop.service';
import { ContratoAlerta } from '../../models/alerta.model';

@Component({
  selector: 'app-buscador',
  standalone: true, // Esto define que es Angular 18 Native
  imports: [CommonModule, ReactiveFormsModule], // Importamos las herramientas aquí
  templateUrl: './buscador.component.html',
  styleUrls: ['./buscador.component.css']
})
export class BuscadorComponent implements OnInit {
  motorForm!: FormGroup;
  alertas: ContratoAlerta[] = [];
  totalAlertas: number = 0;
  cargando: boolean = false;
  busquedaRealizada: boolean = false;

  constructor(private fb: FormBuilder, private secopService: SecopService) {}

  ngOnInit(): void {
    // Valores por defecto para iniciar el formulario
    this.motorForm = this.fb.group({
      ciudad: [''],
      entidad: [''],
      busqueda: [''],
      umbral_corbatas: [2],
      umbral_fraccionamiento: [2],
      umbral_valor: [40000000]
    });
  }

  analizarDatos(): void {
    this.cargando = true;
    this.busquedaRealizada = true;
    const filtros = this.motorForm.value;

    this.secopService.ejecutarMotorRiesgo(filtros).subscribe({
      next: (respuesta) => {
        this.alertas = respuesta.datos;
        this.totalAlertas = respuesta.total_alertas;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error del servidor:', err);
        this.cargando = false;
      }
    });
  }

  // Lógica para asignar colores a la tabla según la gravedad
  obtenerClaseRiesgo(puntaje: number): string {
    if (puntaje >= 100) return 'badge bg-danger fs-6 shadow-sm';
    if (puntaje >= 70) return 'badge bg-warning text-dark fs-6 shadow-sm';
    return 'badge bg-secondary fs-6 shadow-sm';
  }
}