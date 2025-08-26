import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UtmService {
  private readonly UTM_KEY = 'utm_data';

  constructor(private route: ActivatedRoute) {}

  getUtmParams(): any {
    // First check URL query parameters
    let urlParams: any = {};
    if (this.route.snapshot.queryParams) {
      Object.entries(this.route.snapshot.queryParams).forEach(([key, value]) => {
        if (key.startsWith('utm_')) {
          urlParams[key] = value;
        }
      });
    }

    // If URL has UTM parameters, return them
    if (Object.keys(urlParams).length > 0) {
      return urlParams;
    }

    // If no URL parameters, check cookies
    const cookieValue = this.getCookie(this.UTM_KEY);
    return cookieValue ? JSON.parse(cookieValue) : null;
  }

  saveUtmParams(params: any) {
    const utmParams = {
      utm_source: params['utm_source'] || null,
      utm_medium: params['utm_medium'] || null,
      utm_campaign: params['utm_campaign'] || null,
      utm_term: params['utm_term'] || null,
      utm_content: params['utm_content'] || null
    };
    
    if (Object.values(utmParams).some(value => value !== null)) {
      this.setCookie(this.UTM_KEY, JSON.stringify(utmParams), 30);
    }
  }
  setCookie(name: string, value: string, days?: number) {
    let expires = "";
    if (days !== undefined) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toUTCString();
    }
    var domain = environment.Name == 'LOCAL' ? ";" : ';domain=.slidone.com; secure; SameSite=Lax';
    document.cookie = `${name}=${value}${expires}; path=/${domain}`;
  }

  getCookie(name: string): string | null {
    const nameEQ = `${name}=`;
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      let c = cookies[i].trim();
      if (c.indexOf(nameEQ) === 0) {
        return c.substring(nameEQ.length);
      }
    }
    return null;
  }

  clearUtmParams() {
    const domain = window.location.hostname.includes('localhost') ? 'localhost' : '.slidone.com';
    document.cookie = `${this.UTM_KEY}=; Path=/; Domain=${domain}; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
  }
}