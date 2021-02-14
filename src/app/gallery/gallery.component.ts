import { Component, OnInit } from '@angular/core';
import { GalleryService } from '../gallery.service';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css']
})
export class GalleryComponent implements OnInit {

  galleryImages = this.galleryService.getGalleryImages();

  constructor(private galleryService: GalleryService) { }

  ngOnInit(): void {
  }

}
