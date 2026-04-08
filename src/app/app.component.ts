import { Component } from '@angular/core';
import { BuscadorComponent } from './components/buscador/buscador.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [BuscadorComponent],
  template: `<app-buscador></app-buscador>`
})
export class AppComponent { }