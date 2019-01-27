import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, QueryList, ContentChildren } from '@angular/core';
import { SliderItemComponent } from './slider-item/slider-item.component';
import { ReplaySubject } from 'rxjs';

@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss']
})
export class SliderComponent implements OnInit, AfterViewInit {

  constructor(
    private hostEl: ElementRef<HTMLElement>
  ) { }

  itemCount: number | undefined; // = 2
  duration = 300;
  moveItemCountPerAction = 1;
  gap: number | undefined; //  = 10
  totalSlide$ = new ReplaySubject<number>(1);

  private itemTranslateXList = [];
  private slideTranslateXList = [];
  private currentItemIndex = 0;
  private currentSlideIndex = 0;
  private itemWidths = [];

  get canNoLeft() {
    return this.currentItemIndex === 0;
  }
  get canNoRight() {
    if (this.slideItemElQueryList === undefined) {
      return true;
    } else {
      return (this.currentItemIndex === this.slideItemElQueryList.length - 1) ? true : false;
    }
  }

  @ViewChild('sliderContainer', { read: ElementRef })
  private sliderContainerEl: ElementRef<HTMLElement>;

  @ContentChildren(SliderItemComponent, { read: ElementRef })
  private slideItemElQueryList: QueryList<ElementRef<HTMLElement>>;

  private moveTo(itemIndex: number) {
    const currentTranslateX = this.itemTranslateXList[this.currentItemIndex];
    const nextTranslateX = this.itemTranslateXList[itemIndex];
    console.log('currentTranslateX', currentTranslateX);
    console.log('nextTranslateX', nextTranslateX);

    this.sliderContainerEl.nativeElement.animate([
      { transform: `translateX(${currentTranslateX}px)` },
      { transform: `translateX(${nextTranslateX}px)` }
    ] as any, {
        duration: this.duration,
        easing: 'ease-in-out',
        fill: 'forwards'
      });

    this.currentItemIndex = itemIndex;
  }

  goByItem(direction: 'left' | 'right', moveItemAcount: number = this.moveItemCountPerAction) {
    let nextItemIndex = null;
    if (direction === 'left') {
      nextItemIndex = (this.currentItemIndex - moveItemAcount < 0) ? 0 : this.currentItemIndex - moveItemAcount;
    } else {
      const itemLength = this.slideItemElQueryList.length;
      nextItemIndex = (this.currentItemIndex + moveItemAcount > itemLength - 1) ? itemLength - 1 : this.currentItemIndex + moveItemAcount;
    }
    this.moveTo(nextItemIndex);
  }
  goBySlide(slideIndex: number) {
    
  }

  ngOnInit() {

  }

  ngAfterViewInit() {
    const sliderWidth = this.hostEl.nativeElement.clientWidth;
    const gap = (this.gap !== undefined) ? this.gap : 0;

    // calc itemWidths
    if (this.itemCount !== undefined) {
      const itemWidth = (sliderWidth - ((this.itemCount - 1) * gap)) / this.itemCount;
      this.slideItemElQueryList.toArray().forEach((elem, index) => {
        if (this.gap !== undefined && index !== this.slideItemElQueryList.length - 1) {
          elem.nativeElement.style.marginRight = `${this.gap}px`;
        }
        elem.nativeElement.style.width = `${itemWidth}px`;
        this.itemWidths.push(itemWidth);
      });
    } else {
      this.slideItemElQueryList.toArray().forEach((elem, index) => {
        if (this.gap !== undefined && index !== this.slideItemElQueryList.length - 1) {
          elem.nativeElement.style.marginRight = `${this.gap}px`;
        }
        const itemWidth = +window.getComputedStyle(elem.nativeElement).width.replace('px', '');
        this.itemWidths.push(itemWidth);
      });
    }

    // slideContainerWidth
    const slideContainerWidth = this.itemWidths.reduce((result, item, index) => {
      return result += item + gap;
    }, 0);
    this.sliderContainerEl.nativeElement.style.width = slideContainerWidth + 'px';

    // get itemTranslateXList
    this.itemWidths.forEach((width, index) => {
      if (index === 0) {
        this.itemTranslateXList.push(0);
      } else {
        this.itemTranslateXList.push(this.itemTranslateXList[index - 1] + this.itemWidths[index - 1] + gap);
      }
    });
    this.itemTranslateXList = this.itemTranslateXList.map(x => -x);

    // get slideTranslateXList
    let totalSlide = 1;
    let slideSpace = sliderWidth;
    const items = this.itemWidths.map(itemWidth => ({ width : itemWidth }));
    while ( items.length > 0 ) {
      const item = items.shift();
      if (slideSpace === sliderWidth) {
        slideSpace -= item.width;
      } else {
        const itemWidthWithGap = gap + item.width;
        if (slideSpace - itemWidthWithGap >= 0) {
          slideSpace -= itemWidthWithGap;
        } else {
          totalSlide++;
          slideSpace = sliderWidth;
          slideSpace -= item.width;
        }
      }
    }
    setTimeout(() => {
      this.totalSlide$.next(totalSlide);
    }, 0);
  }
}
