import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'timeDifferencePipe',
    standalone: false
})
export class TimeDifferencePipePipe implements PipeTransform {

  transform(createdtime:any): unknown {
    const currentTime = new Date().getTime();
    const createdOn = new Date(createdtime).getTime();
    const timeDiffInSeconds = (currentTime - createdOn) / 1000;

    const secondsInMinute = 60;
    const secondsInHour = 60 * 60;
    const secondsInDay = 24 * 60 * 60;

    if (timeDiffInSeconds < secondsInMinute) {
      return 'Less than a minute ago';
    } else if (timeDiffInSeconds < secondsInHour) {
      const minutes = Math.floor(timeDiffInSeconds / secondsInMinute);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (timeDiffInSeconds < secondsInDay) {
      const hours = Math.floor(timeDiffInSeconds / secondsInHour);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(timeDiffInSeconds / secondsInDay);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  }

}
