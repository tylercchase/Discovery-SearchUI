import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatSharedModule } from '@shared';
import { ResizableModule } from 'angular-resizable-element';
import { FlexLayoutModule } from '@angular/flex-layout';

import { SbasResultsMenuModule } from './sbas-results-menu/sbas-results-menu.module';
import { SarviewsResultsMenuModule } from './sarviews-results-menu/sarviews-results-menu.module';
import { BaselineResultsMenuModule } from './baseline-results-menu/baseline-results-menu.module';
import { DesktopResultsMenuModule } from './desktop-results-menu/desktop-results-menu.module';
import { MobileResultsMenuModule } from './mobile-results-menu/mobile-results-menu.module';

import { ResultsMenuComponent } from './results-menu.component';
import { SharedModule } from '@shared';


@NgModule({
  declarations: [
    ResultsMenuComponent,
  ],
  imports: [
    CommonModule,
    MatSharedModule,
    ResizableModule,
    FlexLayoutModule,

    SbasResultsMenuModule,
    SarviewsResultsMenuModule,
    BaselineResultsMenuModule,
    DesktopResultsMenuModule,
    MobileResultsMenuModule,
  ],
  exports: [
    ResultsMenuComponent,
  ],
})
export class ResultsMenuModule { }
