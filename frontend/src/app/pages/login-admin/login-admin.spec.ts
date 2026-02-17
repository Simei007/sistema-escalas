import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { LoginAdmin } from './login-admin';
import { ApiService } from '../../services/api.service';

describe('LoginAdmin', () => {
  let component: LoginAdmin;
  let fixture: ComponentFixture<LoginAdmin>;
  let apiMock: { login: ReturnType<typeof vi.fn> };
  let routerMock: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    apiMock = { login: vi.fn() };
    routerMock = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [LoginAdmin],
      providers: [
        { provide: ApiService, useValue: apiMock },
        { provide: Router, useValue: routerMock }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginAdmin);
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
    apiMock.login.mockReturnValue(of({ token: 'abc123', role: 'ESCALANTE', nome: 'Admin' }));
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    component.login = 'admin';
    component.senha = '123';

    component.entrar();

    expect(apiMock.login).toHaveBeenCalledWith({ login: 'admin', senha: '123' });
    expect(setItemSpy).toHaveBeenCalledWith('token', 'abc123');
    expect(setItemSpy).toHaveBeenCalledWith('role', 'ESCALANTE');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/escalante']);
  });
});
