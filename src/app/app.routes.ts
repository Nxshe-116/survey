import { RouterModule, Routes } from '@angular/router';
import { Home } from './home/home';
import { Camper } from './camper/camper';
import { NgModule } from '@angular/core';
import { Sponsor } from './sponsor/sponsor';
import { Contributions } from './contributions/contributions';

export const routes:  Routes = [
  { path: '', component: Home },
{ path: 'camper', component: Camper },
{ path: 'sponsor', component: Sponsor },
{ path: 'contributions', component: Contributions },

];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
