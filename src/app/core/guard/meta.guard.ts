import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { MetaService } from '../Sevices/meta.service';

@Injectable({
  providedIn: 'root'
})
export class MetaGuard  {

  constructor(private metaService: MetaService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // Check if we're navigating to auth pages
    if (state.url.includes('/auth/')) {
      // Auth pages will handle their own meta tags in their components
      return true;
    } else {
      // For all other pages, reset to default meta tags
      this.metaService.resetToDefault();
      return true;
    }
  }
} 