import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SecopService } from '../../services/secop.service';
import { ContratoAlerta, FiltrosMotor } from '../../models/alerta.model';

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
  
  cargando: boolean = false;
  busquedaRealizada: boolean = false;
  totalAlertas: number = 0;
  paginaActual: number = 1;
  totalPaginas: number = 1;
  
  // Manejo de UI y Modal
  errorValidacion: string | null = null;
  alertaSeleccionada: ContratoAlerta | null = null;
  detallesDossier: any[] = []; // Guardará las explicaciones ampliadas

  constructor(private fb: FormBuilder, private secopService: SecopService) {}

  ngOnInit(): void {
    this.motorForm = this.fb.group({
      apiKey: ['', Validators.required], // NUEVO: Campo de clave requerido
      ciudad: [''],
      entidad: [''],
      busqueda: [''],
      umbral_corbatas: [2],
      umbral_fraccionamiento: [2],
      umbral_valor: [40000000]
    });
  }

  analizarDatos(pagina: number = 1): void {
    this.errorValidacion = null; // Limpiamos errores anteriores

    // Validamos que haya puesto clave
    if (!this.motorForm.value.apiKey) {
      this.errorValidacion = "Por favor, ingresa tu clave de investigador para continuar.";
      return;
    }

    this.cargando = true;
    this.busquedaRealizada = true;
    
    // Separamos la llave de los filtros para mandarlos por vías distintas
    const { apiKey, ...filtrosPuros } = this.motorForm.value;
    const filtros: FiltrosMotor = { ...filtrosPuros, pagina: pagina, limite: 10 };

    this.secopService.ejecutarMotorRiesgo(filtros, apiKey).subscribe({
      next: (respuesta) => {
        this.alertas = respuesta.datos;
        this.totalAlertas = respuesta.metadata.total_alertas;
        this.paginaActual = respuesta.metadata.pagina_actual;
        this.totalPaginas = respuesta.metadata.total_paginas;
        this.cargando = false;
      },
      error: (err) => {
        this.cargando = false;
        // Si el backend escupe un error 401 (Unauthorized), mostramos la alerta roja
        if (err.status === 401) {
          this.errorValidacion = "Acceso Denegado. La clave ingresada es incorrecta.";
        } else {
          this.errorValidacion = "Error de conexión con el servidor.";
        }
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

  abrirDossier(alerta: ContratoAlerta): void {
    this.alertaSeleccionada = alerta;
    // Traducimos los hallazgos cortos en explicaciones largas
    this.detallesDossier = this.generarGlosarioInvestigativo(alerta.motivo_alerta);
  }

  cerrarDossier(): void {
    this.alertaSeleccionada = null;
  }

  // EL CEREBRO DE TRADUCCIÓN: Convierte etiquetas en explicaciones detalladas
  generarGlosarioInvestigativo(motivos: string): any[] {
    const glosario = [];
    if (motivos.includes('Corbata')) {
      glosario.push({ 
        titulo: 'Carrusel de Contratos (Corbatas)', 
        desc: 'Una misma persona o empresa registra múltiples contratos simultáneos en esta muestra. Es físicamente inviable cumplir a cabalidad con múltiples obligaciones de tiempo completo, lo que sugiere posible pago de favores o empleos fachada.', 
        icon: 'bi-person-badge' 
      });
    }
    if (motivos.includes('Fraccionamiento')) {
      glosario.push({ 
        titulo: 'Alerta de Fraccionamiento', 
        desc: 'Se detectó que la entidad dividió artificialmente un contrato grande en varios contratos pequeños entregados a la misma empresa. Es una táctica común para evadir el concurso público (Licitación) y entregar el dinero "a dedo".', 
        icon: 'bi-scissors' 
      });
    }
    if (motivos.includes('Contrato Directo >')) {
      glosario.push({ 
        titulo: 'Adjudicación Directa Inusual', 
        desc: 'Se adjudicó un monto multimillonario sin competencia abierta. Aunque la ley contempla excepciones de urgencia, los contratos directos de este calibre representan el mayor riesgo histórico de direccionamiento y favoritismo.', 
        icon: 'bi-currency-dollar' 
      });
    }
    if (motivos.includes('Retrasos')) {
      glosario.push({ 
        titulo: 'Tácticas de Retraso Crítico', 
        desc: 'El contrato acumula adiciones de tiempo superiores a 180 días (6 meses). Esta prórroga excesiva es frecuentemente utilizada para ocultar obras inconclusas, elefantes blancos o justificar futuros sobrecostos.', 
        icon: 'bi-clock-history' 
      });
    }
    if (motivos.includes('Consorcio Multimillonario')) {
      glosario.push({ 
        titulo: 'Uso de Figura Asociativa (Consorcio)', 
        desc: 'El contrato fue ganado por una Unión Temporal o Consorcio. Las redes de corrupción usan estas asociaciones temporales para licuar responsabilidades fiscales, ocultar a los dueños reales o limpiar el historial de empresas inhabilitadas.', 
        icon: 'bi-building-exclamation' 
      });
    }
    if (motivos.includes('Anónimo')) {
      glosario.push({ 
        titulo: 'Opacidad de Identidad (Contratista Oculto)', 
        desc: 'El nombre del adjudicatario final ha sido ofuscado con caracteres "XXXX" o "Sin Descripción". Salvo en contados casos de inteligencia militar, ocultar quién recibe los fondos públicos es una bandera roja crítica de evasión.', 
        icon: 'bi-incognito' 
      });
    }
    if (motivos.includes('IA: Anomalía')) {
      glosario.push({ 
        titulo: 'Detección por Inteligencia Artificial', 
        desc: 'El modelo matemático no supervisado (Isolation Forest) analizó todas las variables de este contrato y determinó que su comportamiento es matemáticamente atípico y marginal en comparación con el 95% del historial de esta entidad.', 
        icon: 'bi-robot' 
      });
    }
    return glosario;
  }
}