import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { LoginMotorista } from './login-motorista';
import { ApiService } from '../../services/api.service';

describe('LoginMotorista', () => {
  let component: LoginMotorista;
  let fixture: ComponentFixture<LoginMotorista>;
  let apiMock: { login: ReturnType<typeof vi.fn> };
  let routerMock: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    apiMock = { login: vi.fn() };
    routerMock = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [LoginMotorista],
      providers: [
        { provide: ApiService, useValue: apiMock },
        { provide: Router, useValue: routerMock }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginMotorista);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show validation error when login or senha is empty', () => {
    component.login = '';
    component.senha = '';

    component.entrar();

    expect(component.erro).toBe('Preencha login e senha.');
    expect(apiMock.login).not.toHaveBeenCalled();
  });

  it('should call api and navigate on successful login', () => {
    apiMock.login.mockReturnValue(of({ token: 'abc123', role: 'MOTORISTA', nome: 'Motorista 1' }));
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    component.login = 'motorista';
    component.senha = '123';

    component.entrar();

    expect(apiMock.login).toHaveBeenCalledWith({ login: 'motorista', senha: '123' });
    expect(setItemSpy).toHaveBeenCalledWith('token', 'abc123');
    expect(setItemSpy).toHaveBeenCalledWith('role', 'MOTORISTA');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/motorista']);
  });
});
