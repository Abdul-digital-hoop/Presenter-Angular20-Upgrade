import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ToastrModule } from 'ngx-toastr';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { AuthInterceptor } from './core/Interceptor/auth.interceptor';
import { AccountService } from './core/Sevices/account.service';
import { AuthModule } from './Modules/auth/auth.module';
import { SharedModule } from './shared/shared.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule, DecimalPipe, PathLocationStrategy } from '@angular/common';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { ImageCropperModule } from 'ngx-image-cropper';
import { HomeRoutingModule } from './Modules/Home/home-routing.module';
import { UserSettingsRoutingModule } from './Modules/user-settings/user-settings-routing.module';
import { FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';


declare const _IntegrationMediumOffice:boolean;
@NgModule({ declarations: [
        AppComponent
    ],
    bootstrap: [AppComponent], imports: [BrowserModule,
        CommonModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        // 3rdParty module
        AuthModule,
        // core & shared
        CoreModule,
        FormsModule,
        SharedModule,
        ImageCropperModule,
        //ToastrCongfiguraion
        ToastrModule.forRoot({
            timeOut: 5000, // 5 seconds
            closeButton: true,
            progressBar: false,
        }),
        HomeRoutingModule,
        UserSettingsRoutingModule,
        DragDropModule], providers: [
        DecimalPipe,
        AccountService,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true
        },
        {
            provide: LocationStrategy,
            useClass: _IntegrationMediumOffice ? HashLocationStrategy : PathLocationStrategy,
        },
        provideHttpClient(withInterceptorsFromDi()),
    ] })
export class AppModule { }
