import { Component } from '@angular/core';
import { BuscadorComponent } from './components/buscador/buscador.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [BuscadorComponent], // <-- Importamos tu componente aquí
  template: `<app-buscador></app-buscador>` // <-- Renderizamos directamente el buscador
})
export class AppComponent { }