import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';

import { AppComponent } from './app.component';
import { TopBarComponent } from './top-bar/top-bar.component';
import { GalleryComponent } from './gallery/gallery.component';
import { ViewerComponent } from './viewer/viewer.component';


@NgModule({
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatMenuModule,
    MatButtonModule,
    RouterModule.forRoot([
      { path: '', component: GalleryComponent },
      { path: 'gallery/:name', component: GalleryComponent },
      { path: 'viewer', component: ViewerComponent }
    ])
  ],
  declarations: [
    AppComponent,
    TopBarComponent,
    GalleryComponent,
    ViewerComponent
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }
