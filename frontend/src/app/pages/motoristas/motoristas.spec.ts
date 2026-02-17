import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { Motoristas } from './motoristas';
import { ApiService } from '../../services/api.service';

describe('Motoristas', () => {
  let component: Motoristas;
  let fixture: ComponentFixture<Motoristas>;
  let apiMock: {
    criarMotorista: ReturnType<typeof vi.fn>;
    getMotoristas: ReturnType<typeof vi.fn>;
    removerMotorista: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    apiMock = {
      criarMotorista: vi.fn(),
      getMotoristas: vi.fn(),
      removerMotorista: vi.fn()
    };

    apiMock.getMotoristas.mockReturnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [Motoristas],
      providers: [{ provide: ApiService, useValue: apiMock }]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Motoristas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should validate required fields before saving', () => {
    component.nome = '';
    component.login = '';
    component.senha = '';

    component.salvar();

    expect(component.erro).toBe('Preencha nome, login e senha.');
    expect(apiMock.criarMotorista).not.toHaveBeenCalled();
  });

  it('should save and clear form', () => {
    apiMock.criarMotorista.mockReturnValue(of({ ok: true }));
    apiMock.getMotoristas.mockReturnValue(of([{ id: 1, nome: 'Joao' }]));
    component.nome = 'Joao';
    component.login = 'joao';
    component.senha = '123';

    component.salvar();

    expect(apiMock.criarMotorista).toHaveBeenCalledWith({
      nome: 'Joao',
      login: 'joao',
      senha: '123'
    });
    expect(component.mensagem).toBe('Motorista cadastrado com sucesso.');
    expect(component.nome).toBe('');
    expect(component.login).toBe('');
    expect(component.senha).toBe('');
  });

  it('should set error when load fails', () => {
    apiMock.getMotoristas.mockReturnValue(throwError(() => new Error('falha')));

    component.carregarMotoristas();

    expect(component.erro).toBe('Nao foi possivel carregar os motoristas.');
  });

  it('should delete motorista and reload list', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    apiMock.removerMotorista.mockReturnValue(of({ ok: true }));
    const carregarSpy = vi.spyOn(component, 'carregarMotoristas').mockImplementation(() => {});

    component.excluirMotorista(5);

    expect(apiMock.removerMotorista).toHaveBeenCalledWith(5);
    expect(component.mensagem).toBe('Motorista excluido com sucesso.');
    expect(carregarSpy).toHaveBeenCalled();
  });
});
