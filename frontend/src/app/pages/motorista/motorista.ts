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
  avisoModalAberto = false;
  escalas: EscalaResumo[] = [];

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit() {
    this.abrirModalAviso();
    this.carregarEscalas();
  }

  private abrirModalAviso() {
    if (typeof window === 'undefined') {
      return;
    }

    this.avisoModalAberto = true;
  }

  fecharModalAviso() {
    this.avisoModalAberto = false;
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

  formatarDataBr(data: string) {
    if (!data) {
      return '';
    }

    const somenteData = data.includes('T') ? data.split('T')[0] : data;
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(somenteData);
    if (match) {
      const [, ano, mes, dia] = match;
      return `${Number(dia)}/${Number(mes)}/${ano}`;
    }

    return data;
  }

  formatarHoraSemSegundos(hora: string) {
    if (!hora) {
      return '';
    }

    const match = /^(\d{2}):(\d{2})/.exec(hora);
    if (match) {
      return `${match[1]}:${match[2]}`;
    }

    return hora;
  }
}
