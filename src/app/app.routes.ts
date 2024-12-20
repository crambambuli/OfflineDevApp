import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home'
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.component').then(
      (c) => c.HomeComponent
    ),
    title: 'Home'
  },
  {
    path: 'genderize',
    loadComponent: () => import('./genderize/genderize.component').then(
      (c) => c.GenderizeComponent
    ),
    title: 'Genderize'
  },
  {
    path: 'agify',
    loadComponent: () => import('./agify/agify.component').then(
      (c) => c.AgifyComponent
    ),
    title: 'Agify'
  },
  {
    path: 'nationalize',
    loadComponent: () => import('./nationalize/nationalize.component').then(
      (c) => c.NationalizeComponent
    ),
    title: 'Nationalize'
  }
];
