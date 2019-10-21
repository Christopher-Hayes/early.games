import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// Components
import { UrComponent } from './views/ur/ur.component';

const routes: Routes = [
  {
    path: 'ur',
    component: UrComponent,
    data: {
      title: 'Game of Ur'
    }
  },
  {
    path: '',
    redirectTo: '/ur',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/ur'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
