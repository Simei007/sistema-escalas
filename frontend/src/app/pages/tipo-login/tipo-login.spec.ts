import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';

import { TipoLogin } from './tipo-login';

describe('TipoLogin', () => {
  let component: TipoLogin;
  let fixture: ComponentFixture<TipoLogin>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TipoLogin],
      providers: [provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TipoLogin);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render page title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Sistema de Escalas');
  });

  it('should have buttons for admin and motorista login', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const buttons = compiled.querySelectorAll('button');

    expect(buttons.length).toBe(2);
  });

  it('should navigate to admin login', () => {
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    component.irParaAdmin();
    expect(navigateSpy).toHaveBeenCalledWith(['/login-admin']);
  });

  it('should navigate to motorista login', () => {
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    component.irParaMotorista();
    expect(navigateSpy).toHaveBeenCalledWith(['/login-motorista']);
  });
});
