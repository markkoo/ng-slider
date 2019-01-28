import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, QueryList, ContentChildren } from '@angular/core';
import { SliderItemComponent } from './slider-item/slider-item.component';
import { MediaObserver } from '@angular/flex-layout';
import { ReplaySubject } from 'rxjs';

@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss']
})
export class SliderComponent implements OnInit, AfterViewInit {

  constructor(
    private hostEl: ElementRef<HTMLElement>,
    private mediaObserver: MediaObserver
  ) { }

  @ContentChildren(SliderItemComponent, { read: ElementRef })
  private slideItemElQueryList: QueryList<ElementRef<HTMLElement>>;

  @ViewChild('sliderRailway', { read: ElementRef })
  private sliderRailwayEl: ElementRef<HTMLElement>;

  // config
  scrollForMobile = false;
  looping = false;
  duration = 300;
  paddingLeft = 0; // default 0

  private sliderWidth: number;
  private gap: number;
  private sliderAnimation: any;

  slideTranslateXList = [];
  currentSlideIndex = 0;
  totalSlide = 1;
  totalSlide$ = new ReplaySubject<number>(1);

  get isMobile(): boolean {
    return this.mediaObserver.isActive('xs');
  }

  goBySlide(direction: number | 'left' | 'right') {
    let nextItemIndex = null;
    if (direction === 'left') {
      nextItemIndex = (this.currentSlideIndex < 0) ? 0 : this.currentSlideIndex - 1;
    } else if (direction === 'right') {
      const itemLength = this.slideItemElQueryList.length;
      nextItemIndex = (this.currentSlideIndex > itemLength - 1) ? itemLength - 1 : this.currentSlideIndex + 1;
    } else {
      nextItemIndex = direction;
    }
    this.moveTo(nextItemIndex);
  }

  get canNoLeft() {
    return this.currentSlideIndex === 0;
  }
  get canNoRight() {
    if (this.slideItemElQueryList === undefined) {
      return true;
    } else {
      return (this.currentSlideIndex === this.totalSlide - 1) ? true : false;
    }
  }

  private moveTo(itemIndex: number) {
    const lastSlideIndex = this.totalSlide - 1;
    const currentTranslateX = this.slideTranslateXList[this.currentSlideIndex];
    let jumpBack = false;
    let nextTranslateX: number;
    if ((this.currentSlideIndex === lastSlideIndex && itemIndex === 0) && this.totalSlide > 2) {
      nextTranslateX = this.slideTranslateXList[lastSlideIndex] - this.gap - this.sliderWidth;
      jumpBack = true;
    } else if ((this.currentSlideIndex === 0 && itemIndex === lastSlideIndex) && this.totalSlide > 2) {
      nextTranslateX = this.slideTranslateXList[0] + this.gap + this.sliderWidth;
      jumpBack = true;
    } else {
      nextTranslateX = this.slideTranslateXList[itemIndex];
    }

    console.log('currentTranslateX', currentTranslateX);
    console.log('nextTranslateX', nextTranslateX);

    this.sliderAnimation = this.sliderRailwayEl.nativeElement.animate([
      { transform: `translateX(${currentTranslateX}px)` },
      { transform: `translateX(${nextTranslateX}px)` }
    ] as any, {
        duration: this.duration,
        easing: 'ease-in-out',
        fill: 'none'
      });

    this.sliderAnimation.onfinish = () => {
      if (jumpBack) {
        this.sliderRailwayEl.nativeElement.style.transform = `translateX(${this.slideTranslateXList[itemIndex]}px)`;
      } else {
        this.sliderRailwayEl.nativeElement.style.transform = `translateX(${nextTranslateX}px)`;
      }
      this.currentSlideIndex = itemIndex;
    };
  }

  ngOnInit() {

  }

  ngAfterViewInit() {
    this.sliderWidth = this.hostEl.nativeElement.clientWidth;
    this.gap = +window.getComputedStyle(this.slideItemElQueryList.toArray()[0].nativeElement).marginRight.replace('px', '');

    // collect all item width
    const items = this.slideItemElQueryList.toArray().map(
      item => ({
        element: item.nativeElement,
        width: +window.getComputedStyle(item.nativeElement).width.replace('px', '')
      })
    );

    // set style width
    items.forEach((item, index) => {
      item.element.style.width = `${item.width}px`;
      item.element.style.flex = 'initial';
      // if (index !== this.slideItemElQueryList.length - 1) {
      //   elem.nativeElement.style.marginRight = `${this.gap}px`;
      // } else {
      //   elem.nativeElement.style.marginRight = (this.looping) ? `${this.gap}px` : '0';
      // }
    });



    const totalItemWidthWithGap = items.reduce((result, item) => result + item.width, 0) + (items.length - 1 * this.gap);


    // clone
    if (this.looping && (totalItemWidthWithGap > this.sliderWidth)) {
      const itemForLoopingList = items.map(itemWidth => ({ width: itemWidth }));
      let cloneSlideSpace = this.sliderWidth;
      let totalEndCloneItemWidth = 0;
      for (let i = 0; i < itemForLoopingList.length; i++) {
        if (i === 0) {
          totalEndCloneItemWidth += this.gap;
        }
        cloneSlideSpace -= itemForLoopingList[i].width;
        if (cloneSlideSpace > 0) {
          cloneAndAppendElem(i);
          totalEndCloneItemWidth += itemForLoopingList[i].width;
        } else {
          cloneAndAppendElem(i);
          totalEndCloneItemWidth += itemForLoopingList[i].width;
          break;
        }
      }

    //   cloneSlideSpace = this.sliderWidth;
    //   let totalStartCloneItemWidth = 0;
    //   for (let i = itemForLoopingList.length - 1; i >= 0; i--) {
    //     if (i === itemForLoopingList.length - 1) {
    //       totalStartCloneItemWidth += this.gap;
    //     }
    //     cloneSlideSpace -= itemForLoopingList[i].width;
    //     if (cloneSlideSpace > 0) {
    //       cloneAndPrependElem(i);
    //       totalStartCloneItemWidth += itemForLoopingList[i].width;
    //     } else {
    //       cloneAndPrependElem(i);
    //       totalStartCloneItemWidth += itemForLoopingList[i].width;
    //       break;
    //     }
    //   }

    //   this.sliderRailwayEl.nativeElement.style.width = `${totalStartCloneItemWidth + slideContainerWidth + totalEndCloneItemWidth}px`;
    //   this.sliderRailwayEl.nativeElement.style.left = `${-totalStartCloneItemWidth}px`;
    //   this.sliderRailwayEl.nativeElement.style.position = 'relative';
    //   console.log('totalStartCloneItemWidth', totalStartCloneItemWidth);
    //   console.log('slideContainerWidth', slideContainerWidth);
    //   console.log('totalEndCloneItemWidth', totalEndCloneItemWidth);
    // }

    // // set slide railway
    // const slideContainerWidth = items.reduce((result, itemWidth) => {
    //   return result += itemWidth;
    // }, 0);
    // this.sliderRailwayEl.nativeElement.style.width = `${slideContainerWidth}px`;
    // this.sliderRailwayEl.nativeElement.style.display = 'block';
    // this.sliderRailwayEl.nativeElement.style.flexFlow = 'initial';

    // // set mobile scroll
    // if (this.scrollForMobile && this.isMobile) {
    //   this.hostEl.nativeElement.style.overflow = 'auto';
    //   if (this.looping) {
    //     console.warn('config scrollForMobile can not match with looping');
    //   }
    //   // return;
    // }

    // // calc slide translateX
    // let totalItemWidth = 0;
    // let slideSpace = this.sliderWidth;
    // const items = items.map(itemWidth => ({ width: itemWidth }));
    // this.slideTranslateXList.push(0);
    // while (items.length > 0) {
    //   const item = items.shift();
    //   if (slideSpace === this.sliderWidth || slideSpace - item.width >= 0) {
    //     slideSpace -= item.width;
    //     totalItemWidth += item.width;
    //   } else {
    //     this.slideTranslateXList.push(-totalItemWidth);
    //     this.totalSlide++;
    //     slideSpace = this.sliderWidth - item.width;
    //     totalItemWidth += item.width;
    //   }
    // }
    // if (this.totalSlide > 1) {
    //   const lastTranslateX = (slideContainerWidth - this.sliderWidth) * -1;
    //   this.slideTranslateXList.splice(-1, 1, lastTranslateX);
    // }
    // setTimeout(() => {
    //   this.totalSlide$.next(this.totalSlide);
    // }, 0);

    // const cloneAndAppendElem = (index: number) => {
    //   const clone = this.slideItemElQueryList.toArray()[index].nativeElement.cloneNode(true);
    //   this.sliderRailwayEl.nativeElement.appendChild(clone);
    // };
    // const cloneAndPrependElem = (index: number) => {
    //   const clone = this.slideItemElQueryList.toArray()[index].nativeElement.cloneNode(true);
    //   this.sliderRailwayEl.nativeElement.prepend(clone);
    // };



    // // padding left
    // if (this.paddingLeft !== 0) {
    //   this.sliderRailwayEl.nativeElement.style.marginLeft = `${this.paddingLeft}px`;
    //   const adjustLastTranslateX = this.slideTranslateXList[this.slideTranslateXList.length - 1] - (this.paddingLeft * 2);
    //   this.slideTranslateXList.splice(-1, 1, adjustLastTranslateX);
    // }



    // console.log('itemWidthWithGapList', items);
    // console.log('this.slideTranslateXList', this.slideTranslateXList);
  }

}
