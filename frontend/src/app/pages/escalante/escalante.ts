import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize, timeout } from 'rxjs';
import { ApiService, EscalaPayload, EscalaResumo, MotoristaResumo } from '../../services/api.service';

@Component({
  selector: 'app-escalante',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './escalante.html',
  styleUrls: ['./escalante.css']
})
export class Escalante {
  saidasDisponiveis = [
    'Fretamento',
    'Apresentação na Garagem',
    'Embarque na Ponta da Praia',
    'Embarque no Porto',
    'Embarque na Rodoviária',
    'Plantão'
  ];

  mensagem = '';
  erro = '';
  carregando = false;
  salvando = false;
  salvandoWatchdog: any = null;
  editandoEscalaId: number | null = null;

  motoristas: MotoristaResumo[] = [];
  escalas: EscalaResumo[] = [];

  novaEscala: {
    usuario_id: number | '';
    data: string;
    hora_inicio: string;
    hora_saida: string;
    saida: string;
  } = {
      usuario_id: '',
      data: '',
      hora_inicio: '',
      hora_saida: '',
      saida: ''
    };

  constructor(private api: ApiService, private router: Router) { }

  ngOnInit() {
    this.carregarMotoristas();
    this.carregarEscalas();
  }

  irParaCadastroMotoristas() {
    this.router.navigate(['/motoristas']);
  }

  abrirRelatorios() {
    if (typeof window !== 'undefined') {
      window.open('/relatorios', '_blank');
      return;
    }

    this.router.navigate(['/relatorios']);
  }

  sair() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    this.router.navigate(['/']);
  }

  carregarMotoristas() {
    this.api.getMotoristas().subscribe({
      next: (motoristas) => {
        this.motoristas = Array.isArray(motoristas) ? motoristas : [];
      },
      error: () => {
        this.erro = 'Nao foi possivel carregar os motoristas.';
      }
    });
  }

  carregarEscalas() {
    this.carregando = true;
    this.erro = '';

    this.api.getEscalas().subscribe({
      next: (escalas) => {
        this.escalas = Array.isArray(escalas) ? escalas : [];
      },
      error: () => {
        this.erro = 'Nao foi possivel carregar as escalas.';
      },
      complete: () => {
        this.carregando = false;
      }
    });
  }

  salvarEscala() {
    this.erro = '';
    this.mensagem = '';

    if (
      !this.novaEscala.usuario_id ||
      !this.novaEscala.data ||
      !this.novaEscala.hora_inicio ||
      !this.novaEscala.hora_saida ||
      !this.novaEscala.saida
    ) {
      this.erro = 'Preencha todos os campos da escala.';
      return;
    }

    const payload: EscalaPayload = {
      usuario_id: Number(this.novaEscala.usuario_id),
      data: this.novaEscala.data,
      hora_inicio: this.novaEscala.hora_inicio,
      hora_saida: this.novaEscala.hora_saida,
      saida: this.novaEscala.saida
    };

    this.salvando = true;
    this.salvandoWatchdog = setTimeout(() => {
      this.salvando = false;
      this.erro = 'A operacao demorou demais. Tente novamente.';
    }, 12000);

    const request$ = this.editandoEscalaId
      ? this.api.atualizarEscala(this.editandoEscalaId, payload)
      : this.api.criarEscala(payload);

    request$.pipe(
      timeout(10000),
      finalize(() => {
        if (this.salvandoWatchdog) {
          clearTimeout(this.salvandoWatchdog);
          this.salvandoWatchdog = null;
        }
        this.salvando = false;
      })
    ).subscribe({
      next: (res: any) => {
        const escalaRetornada = res?.escala as EscalaResumo | undefined;
        if (escalaRetornada) {
          if (this.editandoEscalaId) {
            this.escalas = this.escalas.map((escala) =>
              escala.id === escalaRetornada.id ? escalaRetornada : escala
            );
          } else {
            this.escalas = [escalaRetornada, ...this.escalas];
          }
        } else {
          this.carregarEscalas();
        }

        this.mensagem = this.editandoEscalaId
          ? 'Escala atualizada com sucesso.'
          : 'Escala salva com sucesso.';
        this.limparFormulario();
      },
      error: (err: any) => {
        if (err?.name === 'TimeoutError') {
          this.erro = 'Tempo de resposta excedido ao salvar escala.';
          return;
        }

        this.erro = err?.error?.erro || (this.editandoEscalaId
          ? 'Erro ao atualizar escala.'
          : 'Erro ao salvar escala.');
      }
    });
  }

  iniciarEdicao(escala: EscalaResumo) {
    this.erro = '';
    this.mensagem = '';
    this.editandoEscalaId = escala.id;
    this.novaEscala = {
      usuario_id: escala.usuario_id,
      data: this.normalizarDataParaInput(escala.data),
      hora_inicio: this.normalizarHoraParaInput(escala.hora_inicio),
      hora_saida: this.normalizarHoraParaInput(escala.hora_saida),
      saida: escala.saida
    };
  }

  cancelarEdicao() {
    this.limparFormulario();
  }

  removerEscala(id: number) {
    this.erro = '';
    this.mensagem = '';

    const confirmar = window.confirm('Deseja realmente excluir esta escala?');
    if (!confirmar) {
      return;
    }

    this.api.removerEscala(id).subscribe({
      next: () => {
        this.mensagem = 'Escala removida com sucesso.';
        if (this.editandoEscalaId === id) {
          this.limparFormulario();
        }
        this.carregarEscalas();
      },
      error: () => {
        this.erro = 'Erro ao remover escala.';
      }
    });
  }

  private limparFormulario() {
    this.editandoEscalaId = null;
    this.novaEscala = {
      usuario_id: '',
      data: '',
      hora_inicio: '',
      hora_saida: '',
      saida: ''
    };
  }

  getNomeMotorista(usuarioId: number) {
    const motorista = this.motoristas.find((m) => m.id === usuarioId);
    return motorista ? motorista.nome : `ID ${usuarioId}`;
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

  private normalizarDataParaInput(data: string) {
    if (!data) {
      return '';
    }

    return data.includes('T') ? data.split('T')[0] : data;
  }

  private normalizarHoraParaInput(hora: string) {
    if (!hora) {
      return '';
    }

    const match = /^(\d{2}:\d{2})/.exec(hora);
    return match ? match[1] : hora;
  }
}

