import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
  HttpClient,
} from '@angular/common/http';
import {
  Observable,
  catchError,
  concatMap,
  from,
  of,
  retryWhen,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { Router } from '@angular/router';
import { AccountService } from '../Sevices/account.service';
import { environment } from 'src/environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenPromise: Promise<any> | null = null;
  constructor(
    private _router: Router,
    private _accountservice: AccountService,
    private _http: HttpClient
  ) {}
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (localStorage.getItem('token') != null) {
      let clonedReq = req;
      clonedReq = this.AddTokenHeader(req, localStorage.getItem('token'));
      return next.handle(clonedReq).pipe(
        retryWhen((error) => this.retryRequest(error, 5, req, next)),
        catchError((errordata) => {
          if(errordata.status === 0){
            let errorMessage = errordata.statusText;
            return throwError(errorMessage);
          }
          if (errordata.status === 401) {
            return this.HandleRefrehToken(req, next);
          }
          else if (errordata.status === 500) {
            let errorMessage = errordata.error.message;
            const prefix = 'Internal Server Error : ';
        
            if (errorMessage !== undefined) {
                if (errorMessage.startsWith(prefix)) {
                    errorMessage = errorMessage.substring(prefix.length);
                }
            } else {
                try {
                    const errorData = JSON.parse(errordata.error);
                    const fullMessage = errorData.message;
                    errorMessage = fullMessage.replace(prefix, '').trim();
                } catch (e) {
                    errorMessage = 'An unknown error occurred.';
                }
            }
        
            return throwError(errorMessage);
        }
        
          else if (errordata.status === 400) {
            let errorMessage = errordata.error.message;
           // this._router.navigateByUrl('/auth');
            return throwError(errorMessage);
          }
          else if (errordata.status === 404) {
            let errorMessage = errordata.error.message;
            const prefix = 'Internal Server Error : ';
        
            if (errorMessage !== undefined) {
                if (errorMessage.startsWith(prefix)) {
                    errorMessage = errorMessage.substring(prefix.length);
                }
            } else {
                try {
                    const errorData = JSON.parse(errordata.error);
                    const fullMessage = errorData.message;
                    errorMessage = fullMessage.replace(prefix, '').trim();
                } catch (e) {
                    errorMessage = 'An unknown error occurred.';
                }
            }
            return throwError(errorMessage);
          }
          else if (errordata.status === 403) {
            let errorMessage = errordata.error.message;
           // this._router.navigateByUrl('/auth');
            return throwError(errorMessage);
          }
          else if (errordata.status === 409) {
            let errorMessage = errordata;
           // this._router.navigateByUrl('/auth');
            return throwError(errorMessage);
          }
        })
      );
    } else {
      //  this._router.navigateByUrl('/auth');
      // return next.handle(req.clone());
      if (req.url.includes('/auth')) {
        this._router.navigateByUrl('/auth');
      }
      //return next.handle(req.clone());
      return next.handle(req.clone()).pipe(
        retryWhen((error) => this.retryRequest(error, 5, req, next)),
        catchError((errordata) => {
          if(errordata.status === 0){
            let errorMessage = errordata.statusText;
            return throwError(errorMessage);
          }
          if (errordata.status === 401) {
            return this.HandleRefrehToken(req, next);
          }
          else if (errordata.status === 500) {
            let errorMessage = errordata.error.message;
            const prefix = 'Internal Server Error : ';
        
            if (errorMessage !== undefined) {
                if (errorMessage.startsWith(prefix)) {
                    errorMessage = errorMessage.substring(prefix.length);
                }
            } else {
                try {
                    const errorData = JSON.parse(errordata.error);
                    const fullMessage = errorData.message;
                    errorMessage = fullMessage.replace(prefix, '').trim();
                } catch (e) {
                    errorMessage = 'An unknown error occurred.';
                }
            }
        
            return throwError(errorMessage);
        }
          else if (errordata.status === 400) {
            let errorMessage = errordata.error.message;
           // this._router.navigateByUrl('/auth');
            return throwError(errorMessage);
          }
          else if (errordata.status === 404) {
            let errorMessage = errordata.error.message;
            const prefix = 'Internal Server Error : ';
        
            if (errorMessage !== undefined) {
                if (errorMessage.startsWith(prefix)) {
                    errorMessage = errorMessage.substring(prefix.length);
                }
            } else {
                try {
                    const errorData = JSON.parse(errordata.error);
                    const fullMessage = errorData.message;
                    errorMessage = fullMessage.replace(prefix, '').trim();
                } catch (e) {
                    errorMessage = 'An unknown error occurred.';
                }
            }
            return throwError(errorMessage);
          }
          else if (errordata.status === 403) {
            let errorMessage = errordata.error.message;
           // this._router.navigateByUrl('/auth');
            return throwError(errorMessage);
          }
          else if (errordata.status === 409) {
            let errorMessage = errordata;
           // this._router.navigateByUrl('/auth');
            return throwError(errorMessage);
          }
        })
      );
    }
  }
  retryRequest(
    error: Observable<unknown>,
    retryCount: number,
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<unknown> {
    return error.pipe(
      concatMap((checkErr: HttpErrorResponse, count: number) => {
        if (count <= retryCount) {
          catchError((errordata) => {
            switch (checkErr.status) {
              case 0:
                return ;//this._router.navigateByUrl('/auth');
              case 403:
                let errorMessage = errordata.error.message;
             // this._router.navigateByUrl('/auth');
              return throwError(errorMessage);
               // return;// this._router.navigateByUrl('/auth');
            }
          })
          return throwError(checkErr);
        }})
       
    );
  }
  setError(error: HttpErrorResponse): string {
    let errorMessage = 'Unkown error occured';
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      if (error.status !== 0) {
        errorMessage = error.error.errorMessage;
      }
    }
    return errorMessage;
  }
  // HandleRefrehToken(request: HttpRequest<any>, next: HttpHandler) {
  //   return this._accountservice.GenertateRefreshToken().pipe(
  //     switchMap((response: any) => {
  //       this._accountservice.storeToken(response?.token);
  //       //this._accountservice.storeRefreshToken(response?.refreshToken);
  //       return next.handle(this.AddTokenHeader(request, response?.token));
  //     }),
  //     catchError((errodata) => {
  //       this._router.navigateByUrl('/auth');
  //       return throwError(errodata);
  //     })
  //   );
  // }
  AddTokenHeader(req: HttpRequest<any>, token: any) {
    return req.clone({
      headers: req.headers.set('Authorization', 'Bearer ' + token),
    });
  }
  HandleRefrehToken(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenPromise = this.GenertateRefreshToken().toPromise();
  
      return from(this.refreshTokenPromise).pipe(
        switchMap((response: any) => {
          this.isRefreshing = false;
          this.refreshTokenPromise = null;
          this.storeToken(response?.token);
          this.setCookie(`${environment.Name.toLowerCase()}token`, response.token, 30);
          return next.handle(this.AddTokenHeader(request, response?.token));
        }),
        catchError((errorData) => {
          this.isRefreshing = false;
          this.refreshTokenPromise = null;
          this._router.navigateByUrl('/auth');
          return throwError(errorData);
        })
      );
    } else {
      return from(this.refreshTokenPromise).pipe(
        switchMap((token: any) => {
          return next.handle(this.AddTokenHeader(request, token?.token));
        })
      );
    }
  }
  GenertateRefreshToken() {
    return this._http.get(environment.MyApi + 'refreshtoken?refreshToken=' + this.getToken())
  }
  getToken() {
    return localStorage.getItem('token')
  }
  storeToken(tokenValue: string) {
    localStorage.setItem('token', tokenValue)
  }
  setCookie(name: string, value: string, days?: number) {
    let expires = "";
    let expirationDate = null;
    if (days !== undefined) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toUTCString();
    }
    var domain = environment.Name == 'LOCAL' ?";" : ';domain=.slidone.com; secure; SameSite=Lax';
    document.cookie = `${name}=${value}${expires}; path=/${domain}`;
  }
}
