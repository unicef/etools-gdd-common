import {GenericObject} from '@unicef-polymer/etools-types';
import {Environment} from '@unicef-polymer/etools-utils/dist/singleton/environment';
const TILE_LAYER: Readonly<string> = 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png';
const TILE_LAYER_LABELS: Readonly<string> = 'https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png';
const arcgisWebmapId = '71608a6be8984b4694f7c613d7048114'; // Default WebMap ID

export interface IMarker extends L.Marker {
  staticData?: any;
}

export type MarkerDataObj = {
  coords: [number, number];
  staticData?: any;
  popup?: string;
};

export class GDDMapHelper {
  map: L.Map | null = null;
  webmap!: GenericObject;
  staticMarkers: IMarker[] | null = null;
  dynamicMarker: IMarker | null = null;
  markerClusters: any | null = null;

  arcgisMapIsAvailable(): Promise<boolean> {
    return fetch(`https://www.arcgis.com/sharing/rest/content/items/${arcgisWebmapId}?f=json`)
      .then((res) => res.json())
      .then((data) => {
        return !data.error;
      })
      .catch((e: any) => {
        console.log('arcgisMapIsAvailable error: ', e);
        return false;
      });
  }

  loadScript(src: string) {
    return new Promise((resolve) => {
      var list = document.getElementsByTagName('script');
      var i = list.length;
      while (i--) {
        if (list[i].src.includes(src)) {
          resolve(true);
          return;
        }
      }

      const script = document.createElement('script');
      script.src = src;
      script.onload = function () {
        resolve(true);
      };

      document.head.append(script);
    });
  }

  async initMap(element: HTMLElement) {
    if (!element) {
      throw new Error('Please provide HTMLElement for map initialization!');
    }
    if (sessionStorage.getItem('arcgisMapIsAvailable') === null) {
      await this.arcgisMapIsAvailable().then((res: boolean) => {
        sessionStorage.setItem('arcgisMapIsAvailable', JSON.stringify(res));
      });
    }

    const arcgisMapIsAvailable = JSON.parse(sessionStorage.getItem('arcgisMapIsAvailable') || '');
    await this.loadScript('node_modules/leaflet/dist/leaflet.js');
    await this.loadScript('node_modules/esri-leaflet/dist/esri-leaflet.js');
    await this.loadScript('node_modules/leaflet.markercluster/dist/leaflet.markercluster.js');
    await this.loadScript('node_modules/@mapbox/leaflet-omnivore/leaflet-omnivore.min.js');
    await this.loadScript('assets/packages/esri-leaflet-webmap.js');
    return arcgisMapIsAvailable ? this.initArcgisMap(element) : this.initOpenStreetMap(element);
  }

  initOpenStreetMap(element: HTMLElement): void {
    L.Icon.Default.imagePath = `${Environment.basePath}assets/images/`;
    this.map = L.map(element);
    L.tileLayer(TILE_LAYER, {pane: 'tilePane'}).addTo(this.map);
    L.tileLayer(TILE_LAYER_LABELS, {pane: 'overlayPane'}).addTo(this.map);
    // compliance for waitForMapToLoad
    setTimeout(() => {
      this.webmap = {_loaded: true};
    }, 10);
  }

  initArcgisMap(mapElement: HTMLElement): void {
    this.webmap = (L as any).esri.webMap(arcgisWebmapId, {map: L.map(mapElement), maxZoom: 20, minZoom: 2});
    this.map = this.webmap._map;
  }

  setStaticMarkers(markersData: MarkerDataObj[]): void {
    this.removeStaticMarkers();
    const markers: L.Marker[] = [];
    markersData.forEach((data: MarkerDataObj) => {
      const marker: IMarker = this.createMarker(data);
      markers.push(marker);
    });
    this.staticMarkers = markers;
  }

  waitForMapToLoad(): Promise<boolean> {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (!(this.webmap && this.webmap._loaded)) {
          return;
        }
        clearInterval(interval);
        resolve(true);
      }, 100);
    });
  }

  addCluster(markersData: MarkerDataObj[], onclick?: (e: any) => void): void {
    this.markerClusters = (L as any).markerClusterGroup();
    const markers: L.Marker[] = [];
    let marker: IMarker;
    (markersData || []).forEach((mark: MarkerDataObj) => {
      const markerPopup = L.popup({closeButton: false}).setContent(`<b>${mark.popup}</b>`);
      marker = L.marker(mark.coords).bindPopup(markerPopup);
      marker.staticData = mark.staticData;
      if (onclick) {
        marker.on('click', function (e) {
          onclick(e);
        });
      }
      markers.push(marker);
      this.markerClusters.addLayer(marker);
    });
    (this.map as L.Map).setMaxZoom(19);
    (this.map as L.Map).addLayer(this.markerClusters);
    this.staticMarkers = markers;
  }

  addStaticMarker(markerData: MarkerDataObj): void {
    if (!this.staticMarkers) {
      this.staticMarkers = [];
    }
    const marker: IMarker = this.createMarker(markerData);
    this.staticMarkers.push(marker);
  }

  removeStaticMarkers(): void {
    if (this.map && this.staticMarkers && this.staticMarkers.length) {
      this.staticMarkers.forEach((marker: L.Marker) => marker.removeFrom(this.map as L.Map));
      this.staticMarkers = [];
    }
  }

  removeStaticMarker(dataId: number): void {
    const markers: IMarker[] = this.staticMarkers || [];
    const index: number = markers.findIndex(({staticData}: any) => staticData && staticData.id === dataId);
    if (~index && this.staticMarkers) {
      this.staticMarkers[index].removeFrom(this.map as L.Map);
      this.staticMarkers.splice(index, 1);
    }
  }

  markerExists(dataId: number): boolean {
    return !!(
      this.staticMarkers && ~this.staticMarkers.findIndex(({staticData}: any) => staticData && staticData.id === dataId)
    );
  }

  reCheckMarkers(dataIds: number[]): void {
    const markers: IMarker[] = this.staticMarkers || [];
    const markersForRemove: IMarker[] = markers.filter(
      ({staticData}: any) => staticData && !~dataIds.indexOf(staticData.id)
    );
    markersForRemove.forEach(({staticData}: any) => this.removeStaticMarker(staticData.id));
  }

  addDynamicMarker(cordinates: [number, number]): void {
    if (!this.map) {
      throw new Error('Please, initialize map!');
    }
    this.removeDynamicMarker();
    this.dynamicMarker = L.marker(cordinates).addTo(this.map);
  }

  changeDMLocation(cordinates: [number, number]): void {
    if (!this.map) {
      throw new Error('Please, initialize map!');
    }
    if (!this.dynamicMarker) {
      this.addDynamicMarker(cordinates);
    } else {
      this.dynamicMarker.setLatLng(cordinates);
    }
  }

  removeDynamicMarker(): void {
    if (!this.map) {
      throw new Error('Please, initialize map!');
    }
    if (this.dynamicMarker) {
      this.dynamicMarker.removeFrom(this.map);
    }
  }

  invalidateSize(): L.Map | null {
    return this.map && this.map.invalidateSize();
  }

  private createMarker(data: MarkerDataObj): IMarker {
    const marker: IMarker = L.marker(data.coords).addTo(this.map as L.Map);
    marker.staticData = data.staticData;
    if (data.popup) {
      const markerPopup = L.popup({closeButton: false}).setContent(`<b>${data.popup}</b>`);
      marker.bindPopup(markerPopup);
    }

    return marker;
  }
}
