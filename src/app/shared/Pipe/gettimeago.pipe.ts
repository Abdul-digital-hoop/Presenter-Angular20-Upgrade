import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'timeAgo',
    pure: false,
    standalone: false
})
export class TimeAgoPipe implements PipeTransform {

  transform(updatedDateTime: any): string {
    if (!updatedDateTime) {
      return ''; 
    }
    const utcDate = new Date(updatedDateTime);
    const currentTime = new Date();
    const timeDifferenceInMilliseconds = currentTime.getTime() - utcDate.getTime();
    if (timeDifferenceInMilliseconds <= 0) {
      return '';
    } else if (timeDifferenceInMilliseconds <= 86400000) { 
      const hours = Math.floor(timeDifferenceInMilliseconds / 3600000);
      const minutes = Math.floor((timeDifferenceInMilliseconds % 3600000) / 60000);
      const seconds = Math.floor(((timeDifferenceInMilliseconds % 3600000) % 60000) / 1000);
  
      if (hours > 0) {
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
      } else if (minutes > 0) {
        return `${minutes} min${minutes !== 1 ? 's' : ''} ago`;
      } else {
        return `${seconds} sec${seconds !== 1 ? 's' : ''} ago`;
      }
    } else if (timeDifferenceInMilliseconds <= 172800000 && timeDifferenceInMilliseconds > 86400000) { 
      return '1 day ago';
    } else if (timeDifferenceInMilliseconds <= 259200000 && timeDifferenceInMilliseconds > 172800000) { 
      return '2 days ago';
    } else {
      const day = utcDate.getDate().toString().padStart(2, '0');
      const month = utcDate.toLocaleString('en-US', { month: 'short' });
      const year = utcDate.getFullYear();
      return `${day}-${month}-${year}`;
    }
  }

}
