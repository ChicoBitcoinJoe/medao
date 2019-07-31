import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'time'
})
export class TimePipe implements PipeTransform {

    transform(seconds: any, args?: any): any {
        let hours = Math.floor(seconds / 3600);
        seconds -= hours*3600;
        let minutes = Math.floor(seconds / 60);
        seconds -= minutes*60;
        seconds = Math.floor(seconds);
        if(!hours) hours = 0;
        if(!minutes) minutes = 0;
        if(!seconds) seconds = 0;
        return hours + 'h ' + minutes + 'm ' + seconds + 's';
    }

}
