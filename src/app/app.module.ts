import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';

import { AgmCoreModule } from '@agm/core';
import { RandomizerComponent } from './randomizer/randomizer.component';

@NgModule({
  declarations: [
    AppComponent,
    RandomizerComponent
  ],
  imports: [
    BrowserModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyCDOkdAi3ANRGBDqXWXaaliEJlLLm1I9h0',
      libraries: ['places']
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }