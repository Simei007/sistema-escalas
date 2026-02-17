import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize, timeout } from 'rxjs';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-motoristas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './motoristas.html',
  styleUrl: './motoristas.css'
})
export class Motoristas {

  nome = '';
  login = '';
  senha = '';
  carregando = false;
  salvando = false;
  excluindoId: number | null = null;
  exclusaoWatchdog: any = null;
  erro = '';
  mensagem = '';
  listaMotoristas: Array<{ id: number; nome: string }> = [];

  constructor(private api: ApiService, private router: Router) { }

  ngOnInit() {
    this.carregarMotoristas();
  }

  sair() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    this.router.navigate(['/']);
  }

  carregarMotoristas() {
    this.carregando = true;
    this.erro = '';

    this.api.getMotoristas().subscribe({
      next: (motoristas: any) => {
        this.listaMotoristas = Array.isArray(motoristas) ? motoristas : [];
      },
      error: () => {
        this.erro = 'Nao foi possivel carregar os motoristas.';
      },
      complete: () => {
        this.carregando = false;
      }
    });
  }

  salvar() {
    this.erro = '';
    this.mensagem = '';

    if (!this.nome.trim() || !this.login.trim() || !this.senha.trim()) {
      this.erro = 'Preencha nome, login e senha.';
      return;
    }

    const data = {
      nome: this.nome,
      login: this.login,
      senha: this.senha
    };

    this.salvando = true;

    this.api.criarMotorista(data).subscribe({
      next: () => {
        this.mensagem = 'Motorista cadastrado com sucesso.';
        this.nome = '';
        this.login = '';
        this.senha = '';
        this.carregarMotoristas();
      },
      error: () => {
        this.erro = 'Erro ao cadastrar motorista.';
      },
      complete: () => {
        this.salvando = false;
      }
    });
  }

  excluirMotorista(id: number) {
    this.erro = '';
    this.mensagem = '';

    const confirmar = window.confirm('Deseja realmente excluir este motorista?');
    if (!confirmar) {
      return;
    }

    this.excluindoId = id;
    this.exclusaoWatchdog = setTimeout(() => {
      this.excluindoId = null;
      this.erro = 'A exclusao demorou demais. Tente novamente.';
    }, 12000);

    this.api.removerMotorista(id).pipe(
      timeout(10000),
      finalize(() => {
        if (this.exclusaoWatchdog) {
          clearTimeout(this.exclusaoWatchdog);
          this.exclusaoWatchdog = null;
        }
        this.excluindoId = null;
      })
    ).subscribe({
      next: () => {
        this.mensagem = 'Motorista excluido com sucesso.';
        this.carregarMotoristas();
      },
      error: (err: any) => {
        if (err?.status === 401) {
          this.erro = 'Sessao expirada. Faca login novamente.';
          this.sair();
          return;
        }

        if (err?.status === 403) {
          this.erro = 'Seu usuario nao tem permissao para excluir motorista.';
          return;
        }

        if (err?.name === 'TimeoutError') {
          this.erro = 'Tempo de resposta excedido ao excluir motorista.';
          return;
        }

        this.erro = err?.error?.erro || 'Erro ao excluir motorista.';
      }
    });
  }
}
