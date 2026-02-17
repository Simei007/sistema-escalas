import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LoginRequest {
  login: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  role: 'ESCALANTE' | 'MOTORISTA';
  nome: string;
}

export interface MotoristaPayload {
  nome: string;
  login: string;
  senha: string;
}

export interface MotoristaResumo {
  id: number;
  nome: string;
}

export interface EscalaPayload {
  usuario_id: number;
  data: string;
  hora_inicio: string;
  hora_fim: string;
  servico: string;
}

export interface EscalaResumo {
  id: number;
  usuario_id: number;
  data: string;
  hora_inicio: string;
  hora_fim: string;
  servico: string;
}

@Injectable({ providedIn: 'root' })
export class ApiService {

  private readonly api = this.buildApiBaseUrl();

  constructor(private http: HttpClient) {}

  private buildApiBaseUrl() {
    if (typeof window === 'undefined') {
      return 'http://localhost:3000';
    }

    return `${window.location.protocol}//${window.location.hostname}:3000`;
  }

  private authOptions() {
    const token = typeof localStorage !== 'undefined'
      ? localStorage.getItem('token')
      : null;

    if (!token) {
      return {};
    }

    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    };
  }

  login(data: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.api}/auth/login`, data);
  }

  criarMotorista(data: MotoristaPayload) {
    return this.http.post(`${this.api}/motoristas`, data, this.authOptions());
  }

  getMotoristas(): Observable<MotoristaResumo[]> {
    return this.http.get<MotoristaResumo[]>(`${this.api}/motoristas`, this.authOptions());
  }

  removerMotorista(id: number) {
    return this.http.delete(`${this.api}/motoristas/${id}`, this.authOptions());
  }

  getEscalas(): Observable<EscalaResumo[]> {
    return this.http.get<EscalaResumo[]>(`${this.api}/escalas`, this.authOptions());
  }

  criarEscala(data: EscalaPayload) {
    return this.http.post(`${this.api}/escalas`, data, this.authOptions());
  }

  atualizarEscala(id: number, data: EscalaPayload) {
    return this.http.put(`${this.api}/escalas/${id}`, data, this.authOptions());
  }

  removerEscala(id: number) {
    return this.http.delete(`${this.api}/escalas/${id}`, this.authOptions());
  }
}
