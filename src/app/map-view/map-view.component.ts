import { Component } from '@angular/core';
import { loadModules, setDefaultOptions } from 'esri-loader';
import esri = __esri;
@Component({
  selector: 'app-map-view',
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.css']
})
export class MapViewComponent {

  // @ts-ignore
  mapView: esri.MapView;
  // @ts-ignore
  defaultBasemap: esri.Basemap = "topo-vector";
  latitude: string = "";
  longitude: string = "";

  private container = "viewMap";
  private centerCoordinates = [35.5, 39];

  ngOnInit() {
    this.initializeMap();
  }

  async initializeMap() {
    try {

      setDefaultOptions({ version: "4.26", css: true });

      const [Map, MapView, config, BasemapToggle] = await loadModules([
        'esri/Map',
        'esri/views/MapView',
        'esri/config',
        "esri/widgets/BasemapToggle",
      ]);

      config.apiKey = "AAPKcc9d8f2cb41049b09e739b345d483129hkNRhKndTx7aF02vO3twu9bp23oeU-jX1bowGJY3s2iPHBLmJTMgHRgK3Rkb5Njf";

      const mapProperties: esri.MapProperties = {
        basemap: this.defaultBasemap
      };
      const map: esri.Map = new Map(mapProperties);

      const mapViewProperties: esri.MapViewProperties = {
        container: this.container,
        map: map,
        center: this.centerCoordinates,
        zoom: 7,
      };
      const mapView: esri.MapView = new MapView(mapViewProperties);
      this.mapView = mapView;

      mapView.on('pointer-move', (event) => {
        let point = mapView.toMap({ x: event.x, y: event.y });
        this.latitude = point.latitude.toString();
        this.longitude = point.longitude.toString();
        console.log(point);
      });

      mapView.when(() => {
        console.log("harita yüklendi");
      });

      //basemap toggle
      {
        const basemapToggle = new BasemapToggle({
          view: mapView,
          nextBasemap: "arcgis-imagery"
        });
        mapView.ui.add(basemapToggle, "bottom-right");
      }

    } catch (error) {
      console.error('hata olustu: ' + error);
    }
  }



}
