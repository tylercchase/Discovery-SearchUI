import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

import { ProjectNameSelectorComponent } from './project-name-selector.component';



@NgModule({
  declarations: [ProjectNameSelectorComponent],
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatAutocompleteModule,
  ],
  exports: [
    ProjectNameSelectorComponent
  ]
})
export class ProjectNameSelectorModule { }
