import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class GalleryService {
  items = [];

  constructor(
    private http: HttpClient
  ) {}

  getGalleryImages() {
    return this.http.get('./assets/gallery.json');
  }
}

