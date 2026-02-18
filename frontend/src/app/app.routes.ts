import { Routes } from '@angular/router';

import { TipoLogin } from './pages/tipo-login/tipo-login';
import { LoginAdmin } from './pages/login-admin/login-admin';
import { LoginMotorista } from './pages/login-motorista/login-motorista';
import { Escalante } from './pages/escalante/escalante';
import { Motorista } from './pages/motorista/motorista';
import { Motoristas } from './pages/motoristas/motoristas';
import { Relatorios } from './pages/relatorios/relatorios';

export const routes: Routes = [
    { path: '', component: TipoLogin },
    { path: 'login-admin', component: LoginAdmin },
    { path: 'login-motorista', component: LoginMotorista },
    { path: 'escalante', component: Escalante },
    { path: 'motorista', component: Motorista },
    { path: 'motoristas', component: Motoristas },
    { path: 'relatorios', component: Relatorios }
];
