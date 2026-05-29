import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import {BrowserAnimationsModule} from '@angular/platform-browser/animations'
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component'; 
import { HttpClientModule } from '@angular/common/http';
import { DataInfoService } from './projects/listmod/data-info.service'; 
import { ReactiveFormsModule } from '@angular/forms'; 
import { StanleyModule } from './projects/stanley/stanley.module';
import { HomeComponent } from './home/home.component';
import { HomeModule } from './home/home.module';
import { Ta9Module } from './projects/ta9/ta9.module';
import { EventListModule } from './projects/listmod/event-list.module';
import { KinoModule } from './projects/kino/kino.module';
import { DimModule } from './dim/dim.module';
import { PortalComponent } from './portal/portal.component';

@NgModule({
  declarations: [
    AppComponent,
    PortalComponent
  ],

  imports: [
    BrowserModule,
    AppRoutingModule,
    StanleyModule,
    HomeModule,
    Ta9Module,
    EventListModule,
    KinoModule,
    DimModule
  ],
  providers: [DataInfoService],
  bootstrap: [AppComponent]
})
export class AppModule { }
