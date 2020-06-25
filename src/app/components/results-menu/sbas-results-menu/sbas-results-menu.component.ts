import {Component, OnInit, Input, OnDestroy, ViewChild, ElementRef} from '@angular/core';

import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ResizeEvent } from 'angular-resizable-element';

import { Store } from '@ngrx/store';
import { AppState } from '@store';
import * as uiStore from '@store/ui';
import * as scenesStore from '@store/scenes';

import { Breakpoints, CMRProductPair } from '@models';
import { ScreenSizeService } from '@services';

import { SubSink } from 'subsink';

enum CardViews {
  LIST = 0,
  DETAIL = 1
}

@Component({
  selector: 'app-sbas-results-menu',
  templateUrl: './sbas-results-menu.component.html',
  styleUrls: ['./sbas-results-menu.component.scss',  '../results-menu.component.scss']
})
export class SBASResultsMenuComponent implements OnInit, OnDestroy {

  @ViewChild('listCard', {read: ElementRef}) listCardView: ElementRef;
  @ViewChild('chartCard', {read: ElementRef}) chartCardView: ElementRef;

  @Input() resize$: Observable<void>;
  public pair: CMRProductPair;

  public view = CardViews.LIST;
  public Views = CardViews;

  public listCardMaxWidth = '38%';
  public chartCardMaxWidth = '55%';

  public breakpoint: Breakpoints;
  public breakpoints = Breakpoints;
  private subs = new SubSink();

  constructor(
    private store$: Store<AppState>,
    private screenSize: ScreenSizeService
  ) { }

  ngOnInit(): void {
    this.subs.add(
      this.screenSize.breakpoint$.subscribe(
        point => this.breakpoint = point
      )
    );

    this.subs.add(
      this.store$.select(scenesStore.getSelectedPair).pipe(
        tap(console.log)
      ).subscribe(
        (selected: CMRProductPair) => this.pair = selected
      )
    );
  }

  public onResizeEnd(event: ResizeEvent): void {
    console.log('Element was resized', event);
    console.log('listCard fxFlex:', this.listCardView.nativeElement);
    console.log('chartCard fxFlex:', this.chartCardView.nativeElement);
    const windowWidth = window.innerWidth
      || document.documentElement.clientWidth
      || document.body.clientWidth;
    const newChartWidth = event.rectangle.width;
    const newChartMaxWidth = Math.round((newChartWidth / windowWidth) * 100);
    const newListMaxWidth = 100 - newChartMaxWidth;

    this.listCardMaxWidth = newListMaxWidth.toString() + '%';
    this.chartCardMaxWidth = newChartMaxWidth.toString() + '%';
    console.log('windowWidth:', windowWidth);
    console.log('newChartWidth:', newChartWidth);
    console.log('newChartMaxWidth:', newChartMaxWidth);
    console.log('newListMaxWidth:', newListMaxWidth);
    console.log('event.rectangle.width:', event.rectangle.width);
    console.log('event.edges.left:', Number(event.edges.left));
    console.log('listCardMaxWidth:', this.listCardMaxWidth);
    console.log('chartCardMaxWidth:', this.chartCardMaxWidth);

    // event.id.style = {
    //   position: 'fixed',
    //   left: `${event.rectangle.left}px`,
    //   top: `${event.rectangle.top}px`,
    //   width: `${event.rectangle.width}px`,
    //   height: `${event.rectangle.height}px`
    // };
  }

  public onToggleFiltersMenu(): void {
    this.store$.dispatch(new uiStore.ToggleFiltersMenu());
  }

  public onSelectList(): void {
    this.view = CardViews.LIST;
  }

  public onSelectDetail(): void {
    this.view = CardViews.DETAIL;
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
