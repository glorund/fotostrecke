import { Component, Input, OnInit, HostListener } from '@angular/core';
import { GalleryService } from '../gallery.service';
import { ActivatedRoute } from '@angular/router';


export class Image {
  width: number;
  height: number;
  path: string;
  compressed_path: string;
  compressed: boolean;
  placeholder_path: string;
  padding: number;

  // this.aspectRatio = this.width / parseFloat(this._height);
  aspectRatio: number;

  public getWidth(height: number): number {
    return height * this.aspectRatio;
  }

  public getHeight(width: number): number {
    return width / this.aspectRatio;
  }
}

export class Gallery {
  title: string;
  decription: string;
  images: Array<Image>;
}

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css']
})

export class GalleryComponent implements OnInit {
  @Input() galleryName: string;
  gallery: Gallery;
  imagesGrid: Array<Array<Image>> = new Array();
  images: Array<Image> = new Array();

  maxHeight = 300;
  spacing = 6;
  rowSize = 4;
  screenWidth: number;
  sub: any;

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
  }

  @HostListener('window:resize', ['$event']) onResize(event?): void {
    this.screenWidth = window.innerWidth - 100;
    if (this.screenWidth < 300) {
      this.screenWidth = 300;
    }
    console.log('screenWidth' + this.screenWidth + ' images ' + this.images.length);
    this.fetchDataAndRender();
  }

private fetchDataAndRender(): void {
  this.galleryService.getGalleryImages(this.galleryName).subscribe (
    (gallery: Gallery) => {
      this.gallery = gallery;
      this.imagesGrid = this.render(gallery.images);
    }
  );
}

// section
private render(images: Array<Image>): Array<Array<Image>> {
  const currentViewWidth = this.screenWidth;
  const length = this.rowSize ||  Math.ceil((currentViewWidth + this.spacing) / (this.maxHeight + this.spacing));
  const height = this.calculateHeight(currentViewWidth, length);

  console.log(' len ' + length + ' height ' + height );

  const gallery: Array<Array<Image>> = new Array();
  images.forEach(image => {
    image.aspectRatio = image.width / image.height;
  });

  // create rows

  while (images.length > 0) {
    let maxWidth = this.spacing * -1;
    const rowImages: Array<Image> = [];

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
  private createRow(currentViewWidth: number, imagesRow: Array<Image>, isIncomplete = false): void{
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

}
