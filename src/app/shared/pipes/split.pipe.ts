import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'split'
})
export class SplitPipe implements PipeTransform {
  transform(val: string): string {
    return val.toString()
      .split('')
      .reverse()
      .map((s, index) => index && index % 3 === 0 ? s + ',' : s)
      .reverse()
      .join('');
  }
}
