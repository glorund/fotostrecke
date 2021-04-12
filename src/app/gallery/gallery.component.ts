import {
    ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener,
    Input, OnChanges, OnDestroy, OnInit, Output, QueryList, SimpleChanges, ViewChild, ViewChildren
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GalleryService, Photo, Gallery } from '../gallery.service';
import { Subscription } from 'rxjs/internal/Subscription';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-gallery',
    templateUrl: './gallery.component.html',
    styleUrls: ['./gallery.component.css']
})
export class GalleryComponent implements OnInit, OnDestroy, OnChanges {

    galleryIs: Gallery;
    imageDataStaticPath = './assets/';
    imageDataCompletePath = '';
    dataFileName = 'main.json';
    images: Array<Photo> = [];
    imagesGrid: Array<Array<Photo>> = [];
    viewerSubscription: Subscription;
    parameterSubcription: Subscription;
    rowIndex = 0;


    @Input('flexBorderSize') providedImageSpacing = 3;
    @Input('flexImageSize') providedImageSize: number = 7;
    @Input('galleryName') providedGalleryName = 'main';
    @Input('metadataUri') providedMetadataUri: string = undefined;
    @Input('maxRowsPerPage') rowsPerPage: number = 200;
    @Input('imagesPerRow') imagesPerRow = 4;
    @Input('maxHeight') maxImageHeight = 300;

    @Output() viewerChange = new EventEmitter<boolean>();

    @ViewChild('galleryContainer', { static: true }) galleryContainer: ElementRef;
    @ViewChildren('imageElement') imageElements: QueryList<any>;

    @HostListener('window:resize', ['$event']) windowResize(event: any): void {
        console.log('OnChanges window:resize with name:'+this.providedGalleryName);
        if (this.providedGalleryName !== undefined) {
            this.fetchDataAndRender();
        } else {
            this.render();
        }
    }

    constructor(public imageService: GalleryService,
        public http: HttpClient,
        public changeDetectorRef: ChangeDetectorRef,
        private activatedRoute: ActivatedRoute) {
    }

    ngOnInit(): void {
        this.parameterSubcription = this.activatedRoute.paramMap.subscribe(params => {
            if (params.get('name') ) {
              this.providedGalleryName = params.get('name');
            }
            this.fetchDataAndRender();
        });

        this.viewerSubscription = this.imageService.showImageViewerChanged$
            .subscribe((visibility: boolean) => this.viewerChange.emit(visibility));
    }

    ngOnChanges(changes: SimpleChanges): void {
        // input params changed
        console.log('OnChanges:'+this.providedGalleryName+' new is:' + changes.providedGalleryName );
        if (changes.providedGalleryName !== undefined) {
            this.fetchDataAndRender();
        } else {
            this.render();
        }
    }

    ngOnDestroy(): void {
        if (this.viewerSubscription) {
            this.viewerSubscription.unsubscribe();
        }
        if (this.parameterSubcription) {
            this.parameterSubcription.unsubscribe();
        }

    }

    openImageViewer(img: any): void {
        let photos: Array<Photo> = [];
        this.imagesGrid.forEach(row => {
            photos = photos.concat(row);
        });
        this.imageService.updateImages(photos);
        this.imageService.updateSelectedImageIndex(photos.indexOf(img));
        this.imageService.showImageViewer(true);
    }

    calcImageMargin(): number {
        const galleryWidth = this.getGalleryWidth();
        const ratio = galleryWidth / 1920;
        return Math.round(Math.max(1, this.providedImageSpacing * ratio));
    }

    private fetchDataAndRender(): void {
        this.imageDataCompletePath = this.providedMetadataUri;

        if (!this.providedMetadataUri) {
            this.imageDataCompletePath = this.providedGalleryName !== '' ?
                `${this.imageDataStaticPath + this.providedGalleryName}.json` :
                this.imageDataStaticPath + this.dataFileName;
        }

        this.http.get(this.imageDataCompletePath)
            .subscribe(
                (gallery: Gallery) => {
                    this.images = [];
                    gallery.images.forEach(image => {
                        this.images.push(new Photo(image));
                    });

                    this.imageService.updateImages(this.images);

                    this.images.forEach(image => {
                        image.galleryImageLoaded = false;
                        image.viewerImageLoaded = false;
                        image.srcAfterFocus = '';
                    });
                    console.log(' images:' + this.images);
                    // twice, single leads to different strange browser behaviour
                    this.render();
                },
                err => {
                    if (this.providedMetadataUri) {
                        console.error(`Provided endpoint '${this.providedMetadataUri}' did not serve metadata correctly or in the expected format.
    See here for more information: https://github.com/BenjaminBrandmeier/angular2-image-gallery/blob/master/docs/externalDataSource.md,
    Original error: ${err}`);
                    } else {
                        console.error(
                            `Did you run the convert script from angular2-image-gallery for your images first? Original error: ${err}`);
                    }
                },
                () => undefined);
    }

    private render(): void {
        this.scaleGallery();
    }

    private shouldAddCandidate(imgRow: Array<any>, candidate: any): boolean {
        const oldDifference = this.calcIdealHeight() - this.calcRowHeight(imgRow);
        imgRow.push(candidate);
        const newDifference = this.calcIdealHeight() - this.calcRowHeight(imgRow);

        return Math.abs(oldDifference) > Math.abs(newDifference);
    }

    private calcRowHeight(imgRow: Array<any>): number {
        const originalRowWidth = this.calcOriginalRowWidth(imgRow);

        const ratio = (this.getGalleryWidth() - (imgRow.length - 1) * this.calcImageMargin()) / originalRowWidth;
        const rowHeight = imgRow[0].height * ratio;

        return rowHeight;
    }

    private calcOriginalRowWidth(imgRow: Array<Photo>): number {
        let originalRowWidth = 0;
        imgRow.forEach(img => {
            const individualRatio = this.calcIdealHeight() / img.height;
            img.width = img.width * individualRatio;
            img.height = this.calcIdealHeight();
            originalRowWidth += img.width;
        });

        return originalRowWidth;
    }

    private calcIdealHeight(): number {
        return this.getGalleryWidth() / (80 / this.providedImageSize) + 100;
    }

    private getGalleryWidth(): number {
        if (this.galleryContainer.nativeElement.clientWidth === 0) {
            // for IE11
            return this.galleryContainer.nativeElement.scrollWidth;
        }
        return this.galleryContainer.nativeElement.clientWidth;
    }

    private scaleGallery(): void {
        // let imageCounter = 0;
        let maximumGalleryImageHeight = 0;
        this.imagesGrid = this.galleryFit(this.images);
        this.changeDetectorRef.detectChanges();
    }

    private checkForAsyncLoading(image: any, imageCounter: number): void {
        const imageElements = this.imageElements.toArray();

        if (image.galleryImageLoaded ||
            (imageElements.length > 0 &&
                imageElements[imageCounter] &&
                this.isScrolledIntoView(imageElements[imageCounter].nativeElement))) {
            image.galleryImageLoaded = true;
            image.srcAfterFocus = image.compressed_path; // min quolity
        } else {
            image.srcAfterFocus = '';
        }
    }

    private isScrolledIntoView(element: any): boolean {
        const elementTop = element.getBoundingClientRect().top;
        const elementBottom = element.getBoundingClientRect().bottom;

        return elementTop < window.innerHeight && elementBottom >= 0 && (elementBottom > 0 || elementTop > 0)
    }

    // TODO new methods / refactor it
    private galleryFit(images: Array<Photo>): Array<Array<Photo>> {
        const currentViewWidth = window.innerWidth - 100;
        let imageCounter = 0;
        const length = this.imagesPerRow ||
            Math.ceil((currentViewWidth + this.providedImageSpacing) / (this.maxImageHeight + this.providedImageSpacing));
        const height = this.calculateHeight(currentViewWidth, length);

        console.log(' len ' + length + ' height ' + height + ' name is:'+ this.providedGalleryName +' images count is ' + images.length);

        const gallery: Array<Array<Photo>> = new Array();
        images.forEach(image => {
            image.aspectRatio = image.width / image.height;
        });

        // create rows

        while (images.length > 0) {
            let maxWidth = this.providedImageSpacing * -1;
            const rowImages: Array<Photo> = [];

            while (true) {
                const image = images.shift();
                maxWidth += this.maxImageHeight * image.aspectRatio + this.providedImageSpacing;
                rowImages.push(image);
                this.checkForAsyncLoading(image, imageCounter++);

                if (maxWidth - this.providedImageSpacing > currentViewWidth) {
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
        return (currentWidth - (this.imagesPerRow - 1) * this.providedImageSpacing) / this.imagesPerRow;
    }
    /**
     * Creates a row of photos with fixed height
     */
    private createRow(currentViewWidth: number, imagesRow: Array<Photo>, isIncomplete = false): void {
        // Calculate height of element
        const targetWidth = currentViewWidth - (imagesRow.length - 1) * this.providedImageSpacing;
        let sumWidth = 0;
        imagesRow.forEach(img => {
            sumWidth += this.maxImageHeight * img.aspectRatio;
        });
        const aspectRatio = sumWidth / targetWidth;
        let finalHeight = this.maxImageHeight / aspectRatio;
        console.log('calculated finalHeight ' + finalHeight);
        if (isIncomplete) {
            finalHeight = this.maxImageHeight;
            // If it barely reaches the max height, it looks like an error. So let's
            // just add a ton of padding by reducing the height of the row.
            if (sumWidth > targetWidth * 9 / 10) {
                finalHeight = this.maxImageHeight * 0.9;
            }
        }

        let i: number;
        for (i = 0; i < imagesRow.length; i++) {
            const img = imagesRow[i];
            img.width = finalHeight * img.aspectRatio;
            img.height = finalHeight;

            if (i !== 0) {
                img.padding = this.providedImageSpacing;
            }
        }
    }
}
