import { Component, OnInit } from '@angular/core';
import { GalleryService } from '../gallery.service';
import { HostListener } from "@angular/core";

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

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css']
})
export class GalleryComponent implements OnInit {

  gallery: Array<Array<Image>> = new Array();
  images: Array<Image> = new Array();

  maxHeight = 300;
  spacing = 6;
  rowSize = 4;
  screenWidth: number;

  galleryImages = this.galleryService.getGalleryImages();

  constructor(private galleryService: GalleryService) {
  }

  ngOnInit(): void {
    this.fetchDataAndRender();
    this.onResize();
  }

  @HostListener('window:resize', ['$event']) onResize(event?) {
    this.screenWidth = window.innerWidth - 100;
    if (this.screenWidth < 300) {
      this.screenWidth = 300;
    }
    console.log('screenWidth' + this.screenWidth + ' images ' + this.images.length);
    this.fetchDataAndRender();
    // this.gallery = this.render(this.images);
    // this.refreshNavigationErrorState()
    // this.changeDetectorRef.detectChanges()
  }

  private fetchDataAndRender(): void {
      this.galleryImages.subscribe (
        (imagesList: Array<Image>) => {
          this.gallery = this.render(imagesList);
        }
      );
  //   this.http.get(this.imageDataCompletePath)
  //     .subscribe(
  //       (data: Array<any>) => {
  //               this.images = data
  //               this.imageService.updateImages(this.images)

  //               this.images.forEach(image => {
  //                 image['galleryImageLoaded'] = false
  //                 image['viewerImageLoaded'] = false
  //                 image['srcAfterFocus'] = ''
  //               })
  //               // twice, single leads to different strange browser behaviour
  //               this.render()
  //               this.render()
  //           },
  //         err => {
  //               if (this.providedMetadataUri) {
  //                 console.error(`Provided endpoint '${this.providedMetadataUri}' did not serve metadata correctly or in the expected format.
  // See here for more information: https://github.com/BenjaminBrandmeier/angular2-image-gallery/blob/master/docs/externalDataSource.md,
  // Original error: ${err}`)
  //               } else {
  //                   console.error(`Did you run the convert script from angular2-image-gallery for your images first? Original error: ${err}`)
  //               }
  //         },
  //       () => undefined)
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
    let rowImages: Array<Image> = [];

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

// private shouldAddCandidate(imgRow: Array<any>, candidate: any): boolean {
//     const oldDifference = this.calcIdealHeight() - this.calcRowHeight(imgRow)
//     imgRow.push(candidate)
//     const newDifference = this.calcIdealHeight() - this.calcRowHeight(imgRow)

//     return Math.abs(oldDifference) > Math.abs(newDifference)
// }

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
    // var rowElem = document.createElement('div');
    // rowElem.className = 'sectionrow';
    // rowElem.style.marginBottom = px(config.spacing);

    // Calculate height of element
    let targetWidth = currentViewWidth - (imagesRow.length - 1) * this.spacing;
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
