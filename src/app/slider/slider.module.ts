import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SliderComponent } from './slider.component';
import { SliderItemComponent } from './slider-item/slider-item.component';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  declarations: [SliderComponent, SliderItemComponent],
  imports: [
    CommonModule,
    FlexLayoutModule
  ],
  exports: [SliderComponent, SliderItemComponent]
})
export class SliderModule { }
