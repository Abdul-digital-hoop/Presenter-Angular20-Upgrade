import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class defaultmediaService {
  private unsplashApiKey = 'v5cuxfP8JVPyhP1SQxodDPBu9wzZOqCBORQZLmVy5wA';
  private unsplashApiUrl = 'https://api.unsplash.com/search/photos';
  private tenorApiKey = 'LIVDSRZULELA'; 
  private tenorApiUrl = "https://g.tenor.com/v1/search?q=";
  constructor(private http: HttpClient) { }

  // Search for images from Unsplash
  searchImages(query: string, perPage: number = 30): Observable<any> {
    return this.http.get<any>(`${this.unsplashApiUrl}?query=${query}&client_id=${this.unsplashApiKey}&per_page=${perPage}`);
  }

  // Search for GIFs from Giphy
   searchGifs(query: string, limit: number = 32): Observable<any> {
    const searchUrl = `${this.tenorApiUrl}${query}&key=${this.tenorApiKey}&limit=${limit}`;
    return this.http.get<any>(searchUrl);
  }

  // Track download when Unsplash image is selected
  trackDownload(downloadLocation: string): Observable<any> {
    const url = `${downloadLocation}?client_id=${this.unsplashApiKey}`;
    return this.http.get(url);
  }
}
