import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tipo-login',
  standalone: true,
  imports: [],
  templateUrl: './tipo-login.html',
  styleUrl: './tipo-login.css'
})
export class TipoLogin {
  titulo = 'Sistema de Escalas';
  subtitulo = 'Selecione o perfil para acessar o sistema.';

  constructor(private router: Router) {}

  irParaAdmin() {
    this.router.navigate(['/login-admin']);
  }

  irParaMotorista() {
    this.router.navigate(['/login-motorista']);
  }
}
