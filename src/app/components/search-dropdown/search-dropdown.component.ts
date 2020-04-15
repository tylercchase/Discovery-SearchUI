import { Component, OnInit, OnDestroy } from '@angular/core';

import {
  trigger, state, style, animate, transition
} from '@angular/animations';
import { MatDialog } from '@angular/material/dialog';

import { Store } from '@ngrx/store';

import { AppState } from '@store';
import * as uiStore from '@store/ui';
import * as searchStore from '@store/search';

import { ScreenSizeService } from '@services';
import { SubSink } from 'subsink';
import * as models from '@models';

@Component({
  selector: 'app-search-dropdown',
  templateUrl: './search-dropdown.component.html',
  styleUrls: ['./search-dropdown.component.scss'],
  animations: [
    trigger('isOpen', [
      state('true', style({transform: 'translateY(0%)'})),
      state('false', style({transform: 'translateY(-10000%)'})
      ),
      transition('true => false', animate('50ms ease-out')),
      transition('false => true', animate('50ms ease-in'))
    ])
  ],
})
export class SearchDropdownComponent implements OnInit, OnDestroy {
  public isFiltersMenuOpen$ = this.store$.select(uiStore.getIsFiltersMenuOpen);

  public searchType$ = this.store$.select(searchStore.getSearchType);
  public searchTypes = models.SearchType;

  public breakpoint: models.Breakpoints;
  public breakpoints = models.Breakpoints;

  public subs = new SubSink();

  constructor(
    private store$: Store<AppState>,
    private screenSize: ScreenSizeService,
    private dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.subs.add(
      this.screenSize.breakpoint$.subscribe(
        breakpoint => this.breakpoint = breakpoint
      )
    );
  }

  public closePanel(): void {
    this.store$.dispatch(new uiStore.CloseFiltersMenu());
  }

  public onSetSearchType(searchType: models.SearchType): void {
    this.store$.dispatch(new searchStore.SetSearchType(searchType));
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}

