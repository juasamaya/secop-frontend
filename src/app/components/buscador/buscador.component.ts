import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SecopService } from '../../services/secop.service';
import { ContratoAlerta } from '../../models/alerta.model';

@Component({
  selector: 'app-buscador',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './buscador.component.html',
  styleUrls: ['./buscador.component.css']
})
export class BuscadorComponent implements OnInit {
  motorForm!: FormGroup;
  alertas: ContratoAlerta[] = [];
  
  // Variables de Estado y Paginación
  cargando: boolean = false;
  busquedaRealizada: boolean = false;
  totalAlertas: number = 0;
  paginaActual: number = 1;
  totalPaginas: number = 1;

  constructor(private fb: FormBuilder, private secopService: SecopService) {}

  ngOnInit(): void {
    this.motorForm = this.fb.group({
      ciudad: [''],
      entidad: [''],
      busqueda: [''],
      umbral_corbatas: [2],
      umbral_fraccionamiento: [2],
      umbral_valor: [40000000]
    });
  }

  analizarDatos(pagina: number = 1): void {
    this.cargando = true;
    this.busquedaRealizada = true;
    
    // Inyectamos la página actual en la petición al backend
    const filtros = { ...this.motorForm.value, pagina: pagina, limite: 10 };

    this.secopService.ejecutarMotorRiesgo(filtros).subscribe({
      next: (respuesta) => {
        this.alertas = respuesta.datos;
        this.totalAlertas = respuesta.metadata.total_alertas;
        this.paginaActual = respuesta.metadata.pagina_actual;
        this.totalPaginas = respuesta.metadata.total_paginas;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error del servidor:', err);
        this.cargando = false;
      }
    });
  }

  cambiarPagina(delta: number): void {
    const nuevaPagina = this.paginaActual + delta;
    if (nuevaPagina >= 1 && nuevaPagina <= this.totalPaginas) {
      this.analizarDatos(nuevaPagina);
    }
  }

  obtenerClaseRiesgo(puntaje: number): string {
    if (puntaje >= 100) return 'badge bg-danger fs-6 shadow-sm';
    if (puntaje >= 70) return 'badge bg-warning text-dark fs-6 shadow-sm';
    return 'badge bg-secondary fs-6 shadow-sm';
  }
}