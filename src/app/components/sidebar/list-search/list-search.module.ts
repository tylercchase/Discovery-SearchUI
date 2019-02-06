import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatFormFieldModule, MatInputModule, MatButtonToggleModule
} from '@angular/material';

import { MatSharedModule } from '@shared';

import { ListSearchComponent } from './list-search.component';

@NgModule({
  declarations: [
    ListSearchComponent
  ],
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonToggleModule,
    MatSharedModule
  ],
  exports: [
    ListSearchComponent
  ]
})
export class ListSearchModule { }
