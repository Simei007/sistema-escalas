import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService, EscalaResumo } from '../../services/api.service';

@Component({
  selector: 'app-motorista',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './motorista.html',
  styleUrl: './motorista.css'
})
export class Motorista {
  nomeMotorista = 'Motorista';
  erro = '';
  carregando = false;
  escalas: EscalaResumo[] = [];

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit() {
    this.carregarEscalas();
  }

  sair() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    this.router.navigate(['/']);
  }

  carregarEscalas() {
    this.carregando = true;
    this.erro = '';

    this.api.getEscalas().subscribe({
      next: (escalas) => {
        this.escalas = Array.isArray(escalas) ? escalas : [];
      },
      error: () => {
        this.erro = 'Nao foi possivel carregar suas escalas.';
      },
      complete: () => {
        this.carregando = false;
      }
    });
  }

  get proximaEscala() {
    if (!this.escalas.length) {
      return null;
    }

    const ordenadas = [...this.escalas].sort((a, b) => {
      const aData = `${a.data}T${a.hora_inicio}`;
      const bData = `${b.data}T${b.hora_inicio}`;
      return aData.localeCompare(bData);
    });

    return ordenadas[0];
  }
}
