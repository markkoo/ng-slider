import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SliderModule } from './slider/slider.module';
import { ArrayRangePipe } from './array-range.pipe';

@NgModule({
  declarations: [
    AppComponent,
    ArrayRangePipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SliderModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
