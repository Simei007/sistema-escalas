import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService, LoginResponse } from '../../services/api.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login-motorista.html',
  styleUrl: './login-motorista.css'
})
export class LoginMotorista {

  login = '';
  senha = '';
  carregando = false;
  erro = '';

  constructor(private api: ApiService, private router: Router) { }

  entrar() {
    this.erro = '';

    if (!this.login.trim() || !this.senha.trim()) {
      this.erro = 'Preencha login e senha.';
      return;
    }

    this.carregando = true;

    this.api.login({ login: this.login, senha: this.senha })
      .subscribe({
        next: (r: LoginResponse) => {
          if (r.role !== 'MOTORISTA') {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            this.erro = 'Este usuario nao tem perfil de motorista.';
            return;
          }

          localStorage.setItem('token', r.token);
          localStorage.setItem('role', r.role);
          this.router.navigate(['/motorista']);
        },
        error: () => {
          this.erro = 'Login ou senha invalidos.';
          this.carregando = false;
        },
        complete: () => {
          this.carregando = false;
        }
      });
  }
}
