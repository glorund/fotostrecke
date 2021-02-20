import { Component, EventEmitter, Input, OnInit, Output, HostListener, ViewChildren, QueryList } from '@angular/core';
import { GalleryService, Photo, Gallery } from '../gallery.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css']
})

export class GalleryComponent implements OnInit {
  @Input() galleryName: string;
  gallery: Gallery;
  imagesGrid: Array<Array<Photo>> = new Array();
  photos: Array<Photo> = new Array();

  maxHeight = 300;
  spacing = 6;
  rowSize = 4;
  screenWidth: number;
  sub: any;

  viewerSubscription: Subscription;

  @Output() viewerChange = new EventEmitter<boolean>();

  @ViewChildren('imageElement') imageElements: QueryList<any>;

  constructor(private galleryService: GalleryService, private activatedRoute: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.screenWidth = window.innerWidth - 100;
    this.sub = this.activatedRoute.paramMap.subscribe(params => {
      console.log(params);
      this.galleryName = params.get('name');
      if (!this.galleryName ) {
        this.galleryName = 'main';
      }
      this.fetchDataAndRender();
   });
    this.viewerSubscription =
     this.galleryService.showImageViewerChanged$.subscribe((visibility: boolean) => this.viewerChange.emit(visibility));
  }

  @HostListener('window:resize', ['$event']) onResize(event?): void {
    this.screenWidth = window.innerWidth - 100;
    if (this.screenWidth < 300) {
      this.screenWidth = 300;
    }
    console.log('screenWidth' + this.screenWidth + ' images ' + this.photos.length);
    this.fetchDataAndRender();
  }

private fetchDataAndRender(): void {
  this.galleryService.getGalleryImages(this.galleryName).subscribe(
    (gallery: Gallery) => {
      this.gallery = gallery;
      for (const img of gallery.images) {
        this.photos.push(new Photo(img));
      }
      this.galleryService.updateImages(this.photos);
      this.imagesGrid = this.render(this.photos);
    }
  );
}

// section
private render(images: Array<Photo>): Array<Array<Photo>> {
  const currentViewWidth = this.screenWidth;
  const length = this.rowSize ||  Math.ceil((currentViewWidth + this.spacing) / (this.maxHeight + this.spacing));
  const height = this.calculateHeight(currentViewWidth, length);

  console.log(' len ' + length + ' height ' + height );

  const gallery: Array<Array<Photo>> = new Array();
  images.forEach(image => {
    image.aspectRatio = image.width / image.height;
  });

  // create rows

  while (images.length > 0) {
    let maxWidth = this.spacing * -1;
    const rowImages: Array<Photo> = [];

    while (true) {
      const image = images.shift();
      maxWidth += this.maxHeight * image.aspectRatio + this.spacing;
      rowImages.push(image);
      if (maxWidth - this.spacing > currentViewWidth) {
        gallery.push(rowImages);
        this.createRow(currentViewWidth, rowImages);
        console.log('row done' + rowImages);
        break;
      }

      if (images.length === 0) {
        gallery.push(rowImages);
        this.createRow(currentViewWidth, rowImages, true);
        console.log('row is ' + rowImages);
        break;
      }
    }
  }
  return gallery;
}

  /**
   * Calculates the height of the square photos
   */
  private calculateHeight(currentWidth: number, length: number): number {
    return (currentWidth - (this.rowSize - 1) * this.spacing) / this.rowSize;
  }
  /**
   * Creates a row of photos with fixed height
   */
  private createRow(currentViewWidth: number, imagesRow: Array<Photo>, isIncomplete = false): void{
    // Calculate height of element
    const targetWidth = currentViewWidth - (imagesRow.length - 1) * this.spacing;
    let sumWidth = 0;
    imagesRow.forEach( img => {
      sumWidth += this.maxHeight * img.aspectRatio;
    });
    const aspectRatio = sumWidth / targetWidth;
    let finalHeight = this.maxHeight / aspectRatio;
    console.log('calculated finalHeight ' + finalHeight);
    if (isIncomplete) {
      finalHeight = this.maxHeight;
      // If it barely reaches the max height, it looks like an error. So let's
      // just add a ton of padding by reducing the height of the row.
      if (sumWidth > targetWidth * 9 / 10) {
        finalHeight = this.maxHeight * 0.9;
      }
    }

    let i: number;
    for (i = 0; i < imagesRow.length; i++) {
      const img = imagesRow[i];
      img.width = finalHeight * img.aspectRatio;
      img.height = finalHeight;

      if (i !== 0) {
        img.padding = this.spacing;
      }
    }
  }

  public openImageViewer(photo: Photo): void {
    console.log('click ' + photo.compressed_path);
    this.galleryService.updateImages(this.photos);
    this.galleryService.updateSelectedImageIndex(this.photos.indexOf(photo));
    this.galleryService.showImageViewer(true);
  }

}
