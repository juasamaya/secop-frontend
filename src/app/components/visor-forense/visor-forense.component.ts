import { Component, ElementRef, OnInit, ViewChild, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Network } from 'vis-network';
import { DataSet } from 'vis-data';
import { RadarService } from '../../services/radar.service';

@Component({
  selector: 'app-visor-forense',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './visor-forense.component.html',
  styleUrls: ['./visor-forense.component.css']
})
export class VisorForenseComponent implements OnInit {
  @ViewChild('networkContainer', { static: true }) networkContainer!: ElementRef;
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;
  @Input() contratoIdSeleccionado!: string;

  private networkInstance: any;
  nodoSeleccionado: any = null;
  subiendoArchivo: boolean = false;

  constructor(private radarService: RadarService) {}

  ngOnInit(): void {
    if (this.contratoIdSeleccionado) {
      this.cargarGrafo(this.contratoIdSeleccionado);
    }
  }

  cargarGrafo(idContrato: string): void {
    this.radarService.obtenerRedForense(idContrato).subscribe((data: any) => {
      
      const nodes = new DataSet<any>(data.nodes);
      const edges = new DataSet<any>(data.edges);
      const networkData: any = { nodes, edges };

      const options = {
        nodes: {
          shape: 'dot', size: 25,
          font: { color: '#ffffff', face: 'Arial' },
          borderWidth: 2, shadow: true
        },
        edges: {
          width: 2,
          font: { color: '#aaaaaa', size: 11, align: 'middle' },
          arrows: { to: { enabled: true, scaleFactor: 0.5 } }
        },
        groups: {
          Contrato: { color: { background: '#10b981', border: '#059669' } },
          Empresa: { color: { background: '#f59e0b', border: '#d97706' } },
          Persona: { color: { background: '#ef4444', border: '#b91c1c' } },
          PEP: { color: { background: '#8b5cf6', border: '#6d28d9' }, size: 35 },
          EntidadPublica: { color: { background: '#3b82f6', border: '#2563eb' }, shape: 'box' }
        },
        physics: {
          barnesHut: { gravitationalConstant: -3000, centralGravity: 0.3, springLength: 150 },
          stabilization: { iterations: 100 }
        },
        interaction: { hover: true, navigationButtons: true }
      };

      this.networkInstance = new Network(this.networkContainer.nativeElement, networkData, options);

      this.networkInstance.on("stabilizationIterationsDone", () => {
        this.networkInstance.setOptions({ physics: false });
      });

      this.networkInstance.on("click", (params: any) => {
        if (params.nodes.length > 0) {
          const nodeId = params.nodes[0];
          this.nodoSeleccionado = nodes.get(nodeId);
        } else {
          this.nodoSeleccionado = null; 
        }
      });
    });
  }

  cerrarPanel(): void {
    this.nodoSeleccionado = null;
  }

  // LÓGICA DE SUBIDA DE EXCEL
  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.subiendoArchivo = true;
      this.radarService.subirArchivoPEP(file).subscribe({
        next: (response) => {
          console.log(response.mensaje);
          this.subiendoArchivo = false;
          // Recargamos el grafo para ver las nuevas conexiones de familiares
          this.cargarGrafo(this.contratoIdSeleccionado);
        },
        error: (err) => {
          console.error("Error subiendo archivo", err);
          this.subiendoArchivo = false;
          alert("Error al procesar el archivo Excel.");
        }
      });
    }
  }
}