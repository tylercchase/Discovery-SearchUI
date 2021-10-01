import { Injectable } from '@angular/core';

import { Map } from 'ol';
import View from 'ol/View.js';
// import { Extent } from 'ol/extent.js';
// import ImageLayer from 'ol/layer/Image.js';
import ImageLayer from 'ol/layer/Image';
import * as polygonStyle from './map/polygon.style';
// import { Projection as VProjection } from '@services/map/views/map-view';
// import Projection from 'ol/proj/Projection.js';

// import * as proj from 'ol/proj';
import Static from 'ol/source/ImageStatic.js';
import { XYZ } from 'ol/source';
import { mapOptions } from '@models';
import TileLayer from 'ol/layer/Tile';
import { Layer, Vector } from 'ol/layer';
// import { WktService } from '@services';
import Polygon from 'ol/geom/Polygon';
import { getCenter } from 'ol/extent';
import VectorSource from 'ol/source/Vector';
import WKT from 'ol/format/WKT';
import LayerGroup from 'ol/layer/Group';
import { Collection } from 'ol';
// import { click } from 'ol/events/condition';
// import { Select } from 'ol/interaction';
// import { Feature } from 'ol';
// import { transformExtent } from 'ol/proj';

interface Dimension {
  width: number;
  height: number;
}

export interface PinnedProduct {
  isPinned: boolean,
  url: string,
  wkt: string,
}

@Injectable({
  providedIn: 'root'
})
export class BrowseMapService {
  private map: Map;
  private browseLayer: ImageLayer;
  private view: View;
  private pinnedProducts: LayerGroup;

  // private selectClick = new Select({
  //   condition: click,
  //   style: null,
  //   // layers: l => !!this.pinnedProducts.getLayersArray().find(pinned => pinned.get("product_id") === l?.get("product_id")),
  // });

  public setBrowse(browse: string, dim: Dimension, wkt: string = ''): void {
    const format = new WKT();
    const feature = format.readFeature(wkt, {dataProjection: 'EPSG:4326',
    featureProjection: 'EPSG:3857'});
    const polygon: Polygon = feature.getGeometry() as Polygon;

    const polygonVectorSource = new VectorSource({
      features: [feature],
      wrapX: mapOptions.wrapX
    })
    const imagePolygonLayer = new Vector({
      source: polygonVectorSource,
      style: polygonStyle.valid,
    })

    console.log(dim);

    const coord = getCenter( polygon.getExtent());

    const Imagelayer = new ImageLayer({
      source: new Static({
        url: browse,
        imageExtent: polygon.getExtent(),
      }),
      opacity: this.browseLayer?.getOpacity() ?? 1.0
    });

    const mapSource = new XYZ({
      url : `https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=bFwkahiCrAA0526OlsHS`,
      wrapX: mapOptions.wrapX,
      tileSize: [512, 512]
    });

    const map_layer = new TileLayer({ source: mapSource });

    if(!this.map) {
    this.view = new View({
      projection: 'EPSG:3857',
      center: coord,
      zoom: 4,
      minZoom: 1,
      maxZoom: 14,
    });

    }

    if (this.map) {
      this.update(this.view, [ imagePolygonLayer, Imagelayer]);
    } else {
      this.pinnedProducts = new LayerGroup();
      this.map = this.newMap(this.view, [map_layer, imagePolygonLayer, Imagelayer]);
      this.map.addLayer(this.pinnedProducts);

      // this.selectClick.setActive(true);

      // this.pinnedProducts.getLayers().inter
      // this.map.addInteraction(this.selectClick);


      // this.selectClick.on('select', e => {
      //   console.log((e))
      // });

      this.map.on("singleclick", e => {
        // const f = this.map.getfeat(e.pixel, {
        //   layerFilter: (l) => l.getClassName() === "product_pin"
        // });
        // console.log(f);
        this.map.forEachLayerAtPixel(e.pixel, l => {
          console.log(e, l.getClassName());
          console.log(l.get("product_id"));

          this.pinnedProducts.getLayers().remove(l);
          this.pinnedProducts.getLayers().push(l);
          // this.pinnedProducts.getLayersArray().slice()
          // l.setZIndex(this.pinnedProducts.getLayers().getLength() + 1);
          return true;
        })
      })

    //   this.map.on("singleclick", (evt) => {
    //     this.map.forEachFeatureAtPixel(evt.pixel, (_, l) => {
    //       // if(!!this.pinnedProducts.getLayers().getArray().includes(l)) {

    //       if(this.pinnedProducts.getLayers().getArray().includes(l)) {
    //         // let removed = (this.pinnedProducts.getLayers() as Collection<ImageLayer>).remove(l);
    //         // let pinnedCopy = this.pinnedProducts.getLayers();
    //         // pinnedCopy.push(removed);
    //         this.pinnedProducts.getLayers().remove(l);
    //         this.pinnedProducts.getLayers().push(l);
    //         // this.pinnedProducts.getLayers().clear();
    //         // this.pinnedProducts.setLayers(pinnedCopy);
    //         // const found = this.pinnedProducts.getLayers().getArray().find(
    //         //   (temp: ImageLayer) => {
    //         //     temp.get("product_id") === l.get("product_id")
    //         //   }
    //         // );


    //         // l.setZIndex(this.pinnedProducts.getLayers().getLength() + 1);
    //         // l.getZIndex()
    //         // this.pinnedProducts.getLayersArray().find(l => l)
    //         // console.log(l.getZIndex());
    //         // this.pinnedProducts.getLayers().remove(found);
    //         // this.pinnedProducts.getLayers().push(found);
    //         // l.setZIndex(this.pinnedProducts.getLayers().getLength())
    //         // console.log(l.getZIndex());
    //         return true;
    //       }
    //     }
    //     );
    //   });
    //   // this.map.on('click', function(event) {

    //   //   this.map
    }

    this.browseLayer = Imagelayer;
  }

  public updateBrowseOpacity(opacity: number) {
    this.browseLayer.setOpacity(opacity);
  }

  public createImageLayer(url: string, wkt: string, className: string = "ol-layer") {
    const format = new WKT();
    const feature = format.readFeature(wkt, {dataProjection: 'EPSG:4326',
    featureProjection: 'EPSG:3857'});
    const polygon: Polygon = feature.getGeometry() as Polygon;

    const imagelayer = new ImageLayer({
      source: new Static({
        url,
        imageExtent: polygon.getExtent(),
      }),
      className,
      zIndex: 0,
      extent: polygon.getExtent(),
      opacity: this.browseLayer?.getOpacity() ?? 1.0
    });

    return imagelayer;
  }

  public togglePinnedProduct() {
    const pinnedLayers = this.pinnedProducts;
    const removed = (pinnedLayers.getLayers() as Collection<ImageLayer>).getArray().find(l => (l.getSource() as Static).getUrl() === (this.browseLayer.getSource() as Static).getUrl());
    if(!removed) {
      pinnedLayers.getLayers().push(this.browseLayer);
    } else {
      this.pinnedProducts.getLayers().remove(removed);
    }
  }

  public setPinnedProducts(pinned: {[product_id in string]: PinnedProduct}) {
    //Built in method Collection.clear() causes flickering when pinning new product,
    // have to keep track of pinned products as work around

    const unpinned_ids = Object.keys(pinned).filter(id => !pinned[id].isPinned);
    const pinned_ids = Object.keys(pinned).filter(id => pinned[id].isPinned);

    this.unpinProducts(unpinned_ids);

    const imageLayers = pinned_ids.reduce((prev, product_id) => {
      let current = prev;
      const pinnedProd = this.createImageLayer(pinned[product_id].url, pinned[product_id].wkt, "product_pin");
      pinnedProd.set("product_id", product_id);
      current.push(pinnedProd);
      return current;
    }, new Collection<ImageLayer>());

    imageLayers.forEach( l => {
      // this.map.addLayer(l);
        this.pinnedProducts.getLayers().push(l);
      }
    );
  }

  private unpinProducts(product_ids: string[]) {
    if(product_ids.length === 0) {
      this.pinnedProducts.getLayers().clear();
      return;
    }
    this.pinnedProducts.getLayers()?.forEach(
      l => {
        if(product_ids.includes(l?.get("product_id"))) {
          // this.map.removeLayer(l);
          this.pinnedProducts.getLayers().remove(l);
        }
      }
    )
  }

  public unpinAll() {
    this.pinnedProducts.getLayers().clear();
  }

  private update(view: View, layer: Layer[]): void {
    this.map.setView(view);
    const mapLayers = this.map.getLayers();
    const baseLayers = layer.slice(0, 3);
    baseLayers.forEach((layer, idx) => mapLayers.setAt(idx + 1, layer));
  }

  private newMap(view: View, layer: Layer[]): Map {
    return new Map({
      layers: layer ,
      target: 'browse-map',
      view
    });
  }

  cleanup(): void {
    this.map = null;
  }
}
