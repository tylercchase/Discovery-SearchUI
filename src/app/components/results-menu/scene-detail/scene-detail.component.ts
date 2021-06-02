import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SubSink } from 'subsink';
import { map, filter, tap } from 'rxjs/operators';
import { Store } from '@ngrx/store';

import { AppState } from '@store';
import * as scenesStore from '@store/scenes';
import * as filtersStore from '@store/filters';
import * as searchStore from '@store/search';
import * as uiStore from '@store/ui';
import * as userStore from '@store/user';

import * as models from '@models';
import { AuthService, PropertyService, ScreenSizeService } from '@services';
import { ImageDialogComponent } from './image-dialog';

import { DatasetForProductService } from '@services';

@Component({
  selector: 'app-scene-detail',
  templateUrl: './scene-detail.component.html',
  styleUrls: ['./scene-detail.component.scss'],
  providers: [ DatasetForProductService ]
})
export class SceneDetailComponent implements OnInit, OnDestroy {
  @Input() isScrollable = true;

  public scene: models.CMRProduct;

  public browses$ = this.store$.select(scenesStore.getSelectedSceneBrowses);
  public jobBrowses$ = this.store$.select(scenesStore.getSelectedOnDemandProductSceneBrowses);
  public dataset: models.Dataset;
  public searchType: models.SearchType;
  public searchTypes = models.SearchType;
  public isLoggedIn: boolean;
  public sceneLen: number;
  public p = models.Props;
  public breakpoint$ = this.screenSize.breakpoint$;
  public breakpoints = models.Breakpoints;
  public isImageLoading = false;
  public selectedProducts: models.CMRProduct[];
  public hasBaseline: boolean;
  public browseIndex = 0;

  public masterOffsets$ = this.store$.select(scenesStore.getMasterOffsets);

  private subs = new SubSink();

  constructor(
    private store$: Store<AppState>,
    private screenSize: ScreenSizeService,
    public dialog: MatDialog,
    public authService: AuthService,
    public prop: PropertyService,
    private datasetForProduct: DatasetForProductService
  ) {}

  ngOnInit() {
    this.subs.add(
      this.store$.select(userStore.getIsUserLoggedIn).subscribe(
        isLoggedIn => this.isLoggedIn = isLoggedIn
      )
    );

    this.subs.add(
      this.screenSize.size$.pipe(
        map(size => size.width > 1750 ? 32 : 16),
      ).subscribe(len => this.sceneLen = len)
    );

    const scene$ = this.store$.select(scenesStore.getSelectedScene).pipe(
      tap(_ => this.isImageLoading = true)
    );

    this.subs.add(
      scene$.pipe(
        tap(scene => this.scene = scene),
        filter(scene => !!scene),
        map(scene => this.datasetForProduct.match(scene)),
        tap(dataset => this.dataset = dataset),
      ).subscribe(_ => this.updateHasBaseline())
    );

    this.subs.add(
      this.store$.select(scenesStore.getSelectedSceneProducts).pipe(
        tap(products => this.selectedProducts = products),
      ).subscribe(_ => {this.updateHasBaseline(); this.browseIndex = 0})
    );

    this.subs.add(
      this.store$.select(searchStore.getSearchType).subscribe(
        searchType => this.searchType = searchType
      )
    );
  }

  public updateHasBaseline(): void {
    this.hasBaseline = (
      this.prop.isRelevant(this.p.BASELINE_TOOL, this.dataset) &&
      !!this.selectedProducts &&
      this.sceneCanInSAR() &&
      this.hasBaselineProductType()
    );
  }

  public sceneCanInSAR(): boolean {
    return this.dataset.id === models.sentinel_1.id ? true : this.selectedProducts
      .map(product => product.metadata.canInSAR)
      .some(canInSAR => !!canInSAR);
  }

  public baselineSceneName(): string {
    if (!this.scene) {
      return '';
    }

    if (this.dataset.id === models.sentinel_1.id) {
      return this.selectedProducts.filter(
          product => product.metadata.productType === 'SLC'
      )[0].name;
    } else {
      return this.scene.name;
    }
  }

  public sceneHasBrowse() {
    return !this.scene.browses[0].includes('no-browse');
  }

  public productHasSceneBrowses() {
    if (this.searchType === this.searchTypes.CUSTOM_PRODUCTS) {
      return this.scene.metadata.job.job_parameters.scenes.some(x => !x.browses[0].includes('no-browse'));
    }
    return false;
  }

  public hasBaselineProductType(): boolean {
    if (!this.selectedProducts || this.dataset.id !== models.sentinel_1.id) {
      return true;
    } else {
      return this.selectedProducts
        .map(product => product.metadata.productType)
        .filter(productType => productType === 'SLC')
        .length > 0;
    }
  }

  public onOpenImage(): void {
    if (!this.sceneHasBrowse()) {
      return;
    }

    this.store$.dispatch(new uiStore.SetIsBrowseDialogOpen(true));

    const dialogRef = this.dialog.open(ImageDialogComponent, {
      width: '99%',
      maxWidth: '99%',
      height: '99%',
      maxHeight: '99%',
      panelClass: 'image-dialog'
    });

    this.subs.add(
      dialogRef.afterClosed().subscribe(
        _ => this.store$.dispatch(new uiStore.SetIsBrowseDialogOpen(false))
      )
    );
  }

  public onSetSelectedAsMaster() {
    this.store$.dispatch(new scenesStore.SetMaster(this.scene.name));
  }

  public findSimilarScenes(): void {
    const scene = this.scene;

    [
      new searchStore.SetSearchType(models.SearchType.DATASET),
      new searchStore.ClearSearch(),
      new filtersStore.SetFiltersSimilarTo(scene),
      new searchStore.MakeSearch()
    ].forEach(action => this.store$.dispatch(action));
  }

  public makeBaselineSearch(): void {
    const sceneName = this.baselineSceneName();
    [
      new searchStore.SetSearchType(models.SearchType.BASELINE),
      new searchStore.ClearSearch(),
      new scenesStore.SetFilterMaster(sceneName),
      new searchStore.MakeSearch()
    ].forEach(action => this.store$.dispatch(action));
  }

  public makeSBASSearch(): void {
    const sceneName = this.baselineSceneName();

    [
      new searchStore.SetSearchType(models.SearchType.SBAS),
      new searchStore.ClearSearch(),
      new scenesStore.SetFilterMaster(sceneName),
      new searchStore.MakeSearch()
    ].forEach(action => this.store$.dispatch(action));
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
