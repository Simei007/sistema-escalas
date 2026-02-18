import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService, EscalaResumo, MotoristaResumo } from '../../services/api.service';

@Component({
  selector: 'app-relatorios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './relatorios.html',
  styleUrl: './relatorios.css'
})
export class Relatorios {
  carregando = false;
  erro = '';
  filtroData = '';
  filtroMotoristaId: number | '' = '';

  escalas: EscalaResumo[] = [];
  motoristas: MotoristaResumo[] = [];

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit() {
    this.carregarDados();
  }

  carregarDados() {
    this.carregando = true;
    this.erro = '';

    this.api.getMotoristas().subscribe({
      next: (motoristas) => {
        this.motoristas = Array.isArray(motoristas) ? motoristas : [];

        this.api.getEscalas().subscribe({
          next: (escalas) => {
            this.escalas = (Array.isArray(escalas) ? escalas : []).sort((a, b) => this.compararEscalas(a, b));
          },
          error: () => {
            this.erro = 'Nao foi possivel carregar as escalas.';
          },
          complete: () => {
            this.carregando = false;
          }
        });
      },
      error: () => {
        this.erro = 'Nao foi possivel carregar os motoristas.';
        this.carregando = false;
      }
    });
  }

  voltar() {
    this.router.navigate(['/escalante']);
  }

  sair() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    this.router.navigate(['/']);
  }

  get relatorioDoDia() {
    if (!this.filtroData) {
      return [];
    }

    return this.escalas
      .filter((escala) => this.normalizarData(escala.data) === this.filtroData)
      .sort((a, b) => this.compararEscalas(a, b));
  }

  get relatorioPorMotorista() {
    if (!this.filtroMotoristaId) {
      return [];
    }

    return this.escalas
      .filter((escala) => escala.usuario_id === Number(this.filtroMotoristaId))
      .sort((a, b) => this.compararEscalas(a, b));
  }

  getNomeMotorista(usuarioId: number) {
    const motorista = this.motoristas.find((m) => m.id === usuarioId);
    return motorista ? motorista.nome : `ID ${usuarioId}`;
  }

  formatarDataBr(data: string) {
    if (!data) {
      return '';
    }

    const somenteData = this.normalizarData(data);
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

  private compararEscalas(a: EscalaResumo, b: EscalaResumo) {
    const aData = this.normalizarData(a.data);
    const bData = this.normalizarData(b.data);

    if (aData < bData) return -1;
    if (aData > bData) return 1;

    const aInicio = this.normalizarHora(a.hora_inicio);
    const bInicio = this.normalizarHora(b.hora_inicio);
    if (aInicio < bInicio) return -1;
    if (aInicio > bInicio) return 1;

    const aSaida = this.normalizarHora(a.hora_saida);
    const bSaida = this.normalizarHora(b.hora_saida);
    if (aSaida < bSaida) return -1;
    if (aSaida > bSaida) return 1;

    return a.id - b.id;
  }

  private normalizarData(data: string) {
    return data.includes('T') ? data.split('T')[0] : data;
  }

  private normalizarHora(hora: string) {
    const match = /^(\d{2}:\d{2})/.exec(hora || '');
    return match ? match[1] : hora;
  }
}

