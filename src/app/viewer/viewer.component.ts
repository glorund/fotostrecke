import { GalleryService, Gallery, Image, Photo } from '../gallery.service';
import { Component } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
    selector: 'viewer',
    templateUrl: './viewer.component.html',
    styleUrls: ['./viewer.component.css'],
    host: {
        '(document:keydown)': 'onKeydown($event)'
    },
    animations: [
        trigger('imageTransition', [
            state('enterFromRight', style({
                opacity: 1,
                transform: 'translate(0px, 0px)'
            })),
            state('enterFromLeft', style({
                opacity: 1,
                transform: 'translate(0px, 0px)'
            })),
            state('leaveToLeft', style({
                opacity: 0,
                transform: 'translate(-100px, 0px)'
            })),
            state('leaveToRight', style({
                opacity: 0,
                transform: 'translate(100px, 0px)'
            })),
            transition('* => enterFromRight', [
                style({
                    opacity: 0,
                    transform: 'translate(30px, 0px)'
                }),
                animate('250ms 500ms ease-in')
            ]),
            transition('* => enterFromLeft', [
                style({
                    opacity: 0,
                    transform: 'translate(-30px, 0px)'
                }),
                animate('250ms 500ms ease-in')
            ]),
            transition('* => leaveToLeft', [
                style({
                    opacity: 1
                }),
                animate('250ms ease-out')]
            ),
            transition('* => leaveToRight', [
                style({
                    opacity: 1
                }),
                animate('250ms ease-out')]
            )
        ]),
        trigger('showViewerTransition', [
            state('true', style({
                opacity: 1
            })),
            state('void', style({
                opacity: 0
            })),
            transition('void => *', [
                style({
                    opacity: 0
                }),
                animate('1000ms ease-in')]
            ),
            transition('* => void', [
                style({
                    opacity: 1
                }),
                animate('500ms ease-out')]
            )
        ])
    ]
})

export class ViewerComponent {
    showViewer: boolean;
    photos: Array<Photo> = new Array();
    currentIdx = 0;
    leftArrowVisible = true;
    rightArrowVisible = true;
    transform: number;
    math: Math;
    private qualitySelectorShown = false;

    constructor(private imageService: GalleryService) {

        imageService.imagesUpdated$.subscribe(
            images => {
                this.photos = images;
                console.log('VIEWER loaded images ' + this.photos);
            });

        imageService.imageSelectedIndexUpdated$.subscribe(
            newIndex => {
                this.currentIdx = newIndex;
                this.photos.forEach(image => image.active = false);
                this.photos[this.currentIdx].active = true;
                this.transform = 0;
                this.updateQuality();
            });
        imageService.showImageViewerChanged$.subscribe(
            showViewer => {
                this.showViewer = showViewer;
            });
        this.math = Math;
    }

    getCurrentPhoto(): any {
      return this.photos[this.currentIdx];
    }

    get leftArrowActive(): boolean {
        return this.currentIdx > 0;
    }

    get rightArrowActive(): boolean {
        return this.currentIdx < this.photos.length - 1;
    }

    pan(swipe: any): void {
        this.transform = swipe.deltaX;
    }

    onResize(): void {
        this.photos.forEach(image => {
            image.viewerImageLoaded = false;
            image.active = false;
        });
        this.updateImage();
    }

    showQualitySelector(): void {
        this.qualitySelectorShown = !this.qualitySelectorShown;
    }

    qualityChanged(newQuality: any): void {
        this.updateImage();
    }

    imageLoaded(image: any): void {
        image.viewerImageLoaded = true;
    }

    /**
     * direction (-1: left, 1: right)
     * swipe (user swiped)
     */
    navigate(direction: number, swipe: any): void {
        if ((direction === 1 && this.currentIdx < this.photos.length - 1) ||
            (direction === -1 && this.currentIdx > 0)) {

            if (direction === -1) {
                this.photos[this.currentIdx].transition = 'leaveToRight';
                this.photos[this.currentIdx - 1].transition = 'enterFromLeft';
            } else {
                this.photos[this.currentIdx].transition = 'leaveToLeft';
                this.photos[this.currentIdx + 1].transition = 'enterFromRight';
            }
            this.currentIdx += direction;

            if (swipe) {
                this.hideNavigationArrows();
            } else {
                this.showNavigationArrows();
            }
            this.updateImage();
        }
    }

    showNavigationArrows(): void {
        this.leftArrowVisible = true;
        this.rightArrowVisible = true;
    }

    closeViewer(): void {
        this.photos.forEach(image => image.transition = undefined);
        this.photos.forEach(image => image.active = false);
        this.imageService.showImageViewer(false);
        console.log('view closed');
    }

    onKeydown(event: KeyboardEvent): void {
        const prevent = [37, 39, 27, 36, 35]
            .find(no => no === event.keyCode);
        if (prevent) {
            event.preventDefault();
        }

        switch (prevent) {
            case 37:
                // navigate left
                this.navigate(-1, false);
                break;
            case 39:
                // navigate right
                this.navigate(1, false);
                break;
            case 27:
                // esc
                this.closeViewer();
                break;
            case 36:
                // pos 1
                this.photos[this.currentIdx].transition = 'leaveToRight';
                this.currentIdx = 0;
                this.photos[this.currentIdx].transition = 'enterFromLeft';
                this.updateImage();
                break;
            case 35:
                // end
                this.photos[this.currentIdx].transition = 'leaveToLeft';
                this.currentIdx = this.photos.length - 1;
                this.photos[this.currentIdx].transition = 'enterFromRight';
                this.updateImage();
                break;
            default:
                break;
        }
    }

    private hideNavigationArrows(): void {
        this.leftArrowVisible = false;
        this.rightArrowVisible = false;
    }

    private updateImage(): void {
        // wait for animation to end
        setTimeout(() => {
            this.photos[this.currentIdx].active = true;
            this.photos.forEach(image => {
                if (image !== this.photos[this.currentIdx]) {
                    image.active = false;
                    this.transform = 0;
                } else {
                  this.updatePhotoQuality(image);
                }
            });
        }, 500);
    }

    private updateQuality(): void {
      // wait for animation to end
      setTimeout(() => {
        this.photos[this.currentIdx].active = true;
        this.photos.forEach(photo => {
            this.updatePhotoQuality(photo);
          }
          );
      }, 500);
    }

    private updatePhotoQuality(photo: Photo): void {
    const screenWidth = window.innerWidth - 100;
    const screenHeight = window.innerHeight - 100;
    const screenAspect = screenWidth / screenHeight;
    console.log('screen aspect ' + screenAspect);

    photo.active = false;
    const isHight: boolean = photo.aspectRatio < screenAspect;
    console.log('isHight:' + isHight + ' aspect:' + photo.aspectRatio + 'calulated Height:'
        + photo.getHeight(screenWidth) + ' path:' + photo.path);
    if (isHight) {
        photo.viewHeight = screenHeight;
        photo.viewWidth = photo.getWidth(screenHeight);
    } else {
        photo.viewWidth = screenWidth;
        photo.viewHeight = photo.getHeight(screenWidth);
    }
    console.log(' to ' + photo.viewHeight + 'x' + photo.viewWidth);
    }
}
