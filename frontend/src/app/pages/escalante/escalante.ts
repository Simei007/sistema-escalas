import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService, EscalaPayload, EscalaResumo, MotoristaResumo } from '../../services/api.service';

@Component({
  selector: 'app-escalante',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './escalante.html',
  styleUrls: ['./escalante.css']
})
export class Escalante {
  mensagem = '';
  erro = '';
  carregando = false;
  salvando = false;
  editandoEscalaId: number | null = null;

  motoristas: MotoristaResumo[] = [];
  escalas: EscalaResumo[] = [];

  novaEscala: {
    usuario_id: number | '';
    data: string;
    hora_inicio: string;
    hora_fim: string;
    servico: string;
  } = {
    usuario_id: '',
    data: '',
    hora_inicio: '',
    hora_fim: '',
    servico: ''
  };

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit() {
    this.carregarMotoristas();
    this.carregarEscalas();
  }

  irParaCadastroMotoristas() {
    this.router.navigate(['/motoristas']);
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
      !this.novaEscala.hora_fim ||
      !this.novaEscala.servico
    ) {
      this.erro = 'Preencha todos os campos da escala.';
      return;
    }

    const payload: EscalaPayload = {
      usuario_id: Number(this.novaEscala.usuario_id),
      data: this.novaEscala.data,
      hora_inicio: this.novaEscala.hora_inicio,
      hora_fim: this.novaEscala.hora_fim,
      servico: this.novaEscala.servico
    };

    this.salvando = true;

    const request$ = this.editandoEscalaId
      ? this.api.atualizarEscala(this.editandoEscalaId, payload)
      : this.api.criarEscala(payload);

    request$.subscribe({
      next: () => {
        this.mensagem = this.editandoEscalaId
          ? 'Escala atualizada com sucesso.'
          : 'Escala salva com sucesso.';
        this.limparFormulario();
        this.carregarEscalas();
      },
      error: () => {
        this.erro = this.editandoEscalaId
          ? 'Erro ao atualizar escala.'
          : 'Erro ao salvar escala.';
      },
      complete: () => {
        this.salvando = false;
      }
    });
  }

  iniciarEdicao(escala: EscalaResumo) {
    this.erro = '';
    this.mensagem = '';
    this.editandoEscalaId = escala.id;
    this.novaEscala = {
      usuario_id: escala.usuario_id,
      data: escala.data,
      hora_inicio: escala.hora_inicio,
      hora_fim: escala.hora_fim,
      servico: escala.servico
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
      hora_fim: '',
      servico: ''
    };
  }

  getNomeMotorista(usuarioId: number) {
    const motorista = this.motoristas.find((m) => m.id === usuarioId);
    return motorista ? motorista.nome : `ID ${usuarioId}`;
  }
}
