import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { GalleryComponent } from './gallery/gallery.component';
import { MenuHeaderComponent } from './menu-header/menu-header.component';

@NgModule({
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    AppComponent,
    GalleryComponent,
    MenuHeaderComponent,
    RouterModule.forRoot([
      { path: '', component: GalleryComponent },
    ])
  ],
  declarations: [
    AppComponent,
    GalleryComponent,
    MenuHeaderComponent
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }