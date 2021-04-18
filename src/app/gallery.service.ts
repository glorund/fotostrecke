import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';

export interface Image {
  width: number;
  height: number;
  path: string;
  compressed_path: string;
  compressed: boolean;
  placeholder_path: string;
}

export class Photo implements Image {
  width: number;
  height: number;
  path: string;
  compressed_path: string;
  compressed: boolean;
  placeholder_path: string;

  viewWidth: number;
  viewHeight: number;

  padding: number;
  aspectRatio: number;
  active: boolean;
  viewerImageLoaded: boolean;
  galleryImageLoaded: boolean;
  transition: string;

  srcAfterFocus: string;

  constructor(source: Image) {
    this.width = source.width;
    this.height = source.height;
    this.path = source.path;
    this.compressed_path = source.compressed_path;
    this.compressed = source.compressed;
    this.placeholder_path = source.placeholder_path;

    this.aspectRatio = this.width / this.height;
}

  getWidth(height: number): number {
    return (height * this.aspectRatio);
  }

  getHeight(width: number): number {
    return (width / this.aspectRatio);
  }
}

export interface Gallery {
  title: string;
  decription: string;
  images: Array<Image>;
}

@Injectable({
  providedIn: 'root'
})

export class GalleryService {
  private imagesUpdatedSource = new Subject<Array<Photo>>();
  private imageSelectedIndexUpdatedSource = new Subject<number>();
  private showImageViewerSource = new Subject<boolean>();

  imagesUpdated$: Observable<Array<Photo>> = this.imagesUpdatedSource.asObservable();
  imageSelectedIndexUpdated$: Observable<number> = this.imageSelectedIndexUpdatedSource.asObservable();
  showImageViewerChanged$: Observable<boolean> = this.showImageViewerSource.asObservable();

  constructor(
    private http: HttpClient
  ) {}

  getGalleryImages(galleryName: string): Observable<object> {
    return this.http.get('./assets/' + galleryName + '.json');
  }

  updateImages(images: Array<Photo>): void {
    this.imagesUpdatedSource.next(images);
  }

  updateSelectedImageIndex(newIndex: number): void {
    this.imageSelectedIndexUpdatedSource.next(newIndex);
  }

  showImageViewer(show: boolean): void {
    this.showImageViewerSource.next(show);
  }
}

