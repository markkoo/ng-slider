import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sArrayRange'
})
export class ArrayRangePipe implements PipeTransform {

  transform(value: number): number[] {
    return Array.from(new Array(value), (_, i) => i + 0);
  }

}
