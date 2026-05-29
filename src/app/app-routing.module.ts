import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DimComponent } from './dim/dim.component';
import { HomeComponent } from './home/home.component';
import { FilmDescriptionComponent } from './projects/kino/film-description/film-description.component';
import { HomePageComponent } from './projects/kino/home-page/home-page.component';
import { KinoComponent } from './projects/kino/kino.component';
import { LoginComponent } from './projects/kino/login/login.component';
import { UserAccountComponent } from './projects/kino/userAccount/userAccount.component';
import { AppEventList } from './projects/listmod/event-list.component';
import { StanleyComponent } from './projects/stanley/stanley.component';
import { AdminPageComponent } from './projects/ta9/admin-page/admin-page.component';
import { Ta9Component } from './projects/ta9/ta9.component';
import { UserPageComponent } from './projects/ta9/user-page/user-page.component';
import { PortalComponent } from './portal/portal.component';

const routes: Routes = [
  { path: '', component: PortalComponent },
  { path: 'dim', component: DimComponent },
  { path: 'pak', component: HomeComponent },
  // { path: 'stanley', component: StanleyComponent },
  // {
  //   path: 'ta9', component: Ta9Component, children: [
  //     { path: '', component: UserPageComponent },
  //     { path: 'user', component: UserPageComponent },
  //     { path: 'admin', component: AdminPageComponent }
  //   ]
  // },
  { path: 'listMode', component: AppEventList },
  {
    path: 'kino',
    component: KinoComponent,
    children: [
      {
        path: 'login',
        component: LoginComponent,
      },
      { path: '', component: HomePageComponent },
      { path: 'userAccount', component: UserAccountComponent },
      { path: 'filmDescription/:id', component: FilmDescriptionComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
