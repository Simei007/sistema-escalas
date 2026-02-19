import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tipo-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tipo-login.html',
  styleUrl: './tipo-login.css'
})
export class TipoLogin {
  titulo = 'Sistema de Escalas';
  subtitulo = 'Selecione o perfil para acessar o sistema.';
  compartilharUrl = '';
  qrCodeUrl = '';
  exibirQrDesktop = false;

  constructor(private router: Router) {
    if (typeof window !== 'undefined') {
      this.compartilharUrl = window.location.href;
      this.qrCodeUrl = `https://quickchart.io/qr?size=220&text=${encodeURIComponent(this.compartilharUrl)}`;
      this.exibirQrDesktop = window.innerWidth >= 900;
    }
  }

  irParaAdmin() {
    this.router.navigate(['/login-admin']);
  }

  irParaMotorista() {
    this.router.navigate(['/login-motorista']);
  }
}
