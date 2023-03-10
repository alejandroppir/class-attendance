import { HttpClient, HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, Injector, NgModule } from '@angular/core';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { APP_LANGUAGES } from './core/constants/general.constants';
import { DirectivesModule } from './core/directives/directives.module';
import { SharedModule } from './shared/shared.module';

export let AppInjector: Injector;
const firestoreImports = [
  provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
  provideFirestore(() => getFirestore()),
  provideAuth(() => getAuth()),
];

export function translateFactory(translate: TranslateService) {
  return async (): Promise<void> => {
    translate.addLangs(
      Object.values(APP_LANGUAGES).map((value) => value.toString())
    );
    translate.setDefaultLang(APP_LANGUAGES.en_EN);
    translate.use(APP_LANGUAGES.es_ES);
    return new Promise<void>((resolve) => {
      translate.onLangChange.subscribe(() => {
        resolve();
      });
    });
  };
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    SharedModule,
    DirectivesModule,
    MatSidenavModule,
    MatCardModule,
    MatIconModule,
    firestoreImports,
    BrowserAnimationsModule,
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: translateFactory,
      deps: [TranslateService],
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(private injector: Injector) {
    AppInjector = this.injector;
  }
}
export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http);
}
