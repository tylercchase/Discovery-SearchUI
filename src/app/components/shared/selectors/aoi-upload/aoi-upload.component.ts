import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';

import { Store } from '@ngrx/store';

import { AppState } from '@store';
import * as mapStore from '@store/map';
import { MapDrawModeType, MapInteractionModeType } from '@models';
import { MapService, WktService } from '@services';

@Component({
  selector: 'app-aoi-upload',
  templateUrl: './aoi-upload.component.html',
  styleUrls: ['./aoi-upload.component.css']
})
export class AoiUploadComponent implements OnInit {
  public drawMode$ = this.store$.select(mapStore.getMapDrawMode);
  public interactionMode$ = this.store$.select(mapStore.getMapInteractionMode);

  public polygon: string;
  public interactionTypes = MapInteractionModeType;

  constructor(
    private store$: Store<AppState>,
    private mapService: MapService,
  ) {}

  ngOnInit() {
    this.mapService.searchPolygon$.subscribe(
      polygon => this.polygon = polygon
    );
  }

  public onFileUpload(): void {
    const action = new mapStore.SetMapInteractionMode(MapInteractionModeType.UPLOAD);
    this.store$.dispatch(action);
  }

  public onNewDrawMode(mode: MapDrawModeType): void {
    this.store$.dispatch(new mapStore.SetMapDrawMode(mode));
  }

  public onClearPolygon(): void {
    this.mapService.clearDrawLayer();
    this.onNewInteractionMode(MapInteractionModeType.DRAW);
  }

  public onNewInteractionMode(mode: MapInteractionModeType): void {
    this.store$.dispatch(new mapStore.SetMapInteractionMode(mode));
  }
}
