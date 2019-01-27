import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SliderComponent } from './slider.component';
import { SliderItemComponent } from './slider-item/slider-item.component';

@NgModule({
  declarations: [SliderComponent, SliderItemComponent],
  imports: [
    CommonModule
  ],
  exports: [SliderComponent, SliderItemComponent]
})
export class SliderModule { }
