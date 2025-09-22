import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

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

  // User Recent Images API methods
  addUserRecentImage(imageUrl: string): Observable<any> {
    return this.http.post<any>(environment.MyApi + 'add-userrecent-images', {
      imageUrl: imageUrl
    });
  }

  getUserRecentImages(): Observable<any> {
    return this.http.get<any>(environment.MyApi + 'get-userrecent-images');
  }

  deleteUserRecentImage(id: number): Observable<any> {
    return this.http.delete<any>(environment.MyApi + 'delete-userrecent-images?id=' + id);
  }
}
