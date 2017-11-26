import { BrowserModule } from '@angular/platform-browser';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { SplitPipe } from './pipes/split.pipe';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    SplitPipe
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule
  ],
  exports: [
    BrowserModule,
    SplitPipe,
    ReactiveFormsModule
  ]
})
export class SharedModule {
  public static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedModule,
      providers: []
    };
  }
}
