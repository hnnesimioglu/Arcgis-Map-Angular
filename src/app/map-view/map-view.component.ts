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

  //longitude, latitude
  private centerCoordinates = [35.5, 39];

  ngOnInit() {
    this.initializeMap();
  }

  async initializeMap() {
    try {

      setDefaultOptions({ version: "4.26", css: true });

      const [Map, MapView, config, BasemapToggle, Graphic, GraphicsLayer, FeatureLayer, Locate, Search, Sketch] = await loadModules([
        'esri/Map',
        'esri/views/MapView',
        'esri/config',
        "esri/widgets/BasemapToggle",
        "esri/Graphic",
        "esri/layers/GraphicsLayer",
        "esri/layers/FeatureLayer",
        "esri/widgets/Locate",
        "esri/widgets/Search",
        "esri/widgets/Sketch"
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
      //popup notification
      const popupTemplate = {
        title: "{Name}",
        content: "{Description}"
      }
      const attributes = {
        Name: String,
        Description: String
      }

      //graphicLayer
      const graphicsLayer = new GraphicsLayer();
      map.add(graphicsLayer);
      //add point 
      {
        const point = { //Create a point
          type: "point",
          longitude: 35.243322,
          latitude: 38.963745
        };
        const simpleMarkerSymbol = {
          type: "simple-marker",
          color: [201, 128, 215],  // Orange
          outline: {
            color: [255, 255, 255], // White
            width: 1
          }
        };

        const pointGraphic = new Graphic({
          geometry: point,
          symbol: simpleMarkerSymbol,
          popupTemplate: popupTemplate,
          attributes: { Name: 'Point', Description: 'Center of Turkey' },
        });
        graphicsLayer.add(pointGraphic);
      }

      //add line
      {
        // Create a line geometry
        const polyline = {
          type: "polyline",
          paths: [
            [30.5386, 38.7581], //Longitude, latitude
            [33.2167, 37.1833], //Longitude, latitude
            [34.6792, 37.9667]  //Longitude, latitude
          ]
        };
        const simpleLineSymbol = {
          type: "simple-line",
          color: [0, 116, 173], // Orange
          width: 2
        };

        const polylineGraphic = new Graphic({
          geometry: polyline,
          symbol: simpleLineSymbol,
          popupTemplate: popupTemplate,
          attributes: { Name: 'Line', Description: 'Afyon, Karaman, Niğde' },
        });
        graphicsLayer.add(polylineGraphic);
      }

      //add polygon
      {
        const polygon = {
          type: "polygon",
          rings: [
            [33.5139, 39.8417], //Longitude, latitude
            [34.9533, 40.5489], //Longitude, latitude
            [37.0167, 39.7500], //Longitude, latitude
          ]
        };

        const simpleFillSymbol = {
          type: "simple-fill",
          color: [39, 185, 102, 0.3],  // Orange, opacity 30%
          outline: {
            color: [255, 255, 255],
            width: 1
          }
        };

        const polygonGraphic = new Graphic({
          geometry: polygon,
          symbol: simpleFillSymbol,
          popupTemplate: popupTemplate,
          attributes: { Name: 'Polygon', Description: 'Kırıkkale, Çorum, Sivas' },
        });
        graphicsLayer.add(polygonGraphic);
      }

      //feature layers
      {
        //Trailheads feature layer (points)
        const trailheadsLayer = new FeatureLayer({
          url: "https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Trailheads/FeatureServer/0"
        });
        map.add(trailheadsLayer);

        //Trails feature layer (lines)
        const trailsLayer = new FeatureLayer({
          url: "https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Trails/FeatureServer/0"
        });
        map.add(trailsLayer, 1);

        // Parks and open spaces (polygons)
        const parksLayer = new FeatureLayer({
          url: "https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Parks_and_Open_Space/FeatureServer/0"
        });
        map.add(parksLayer, 0);
      }

      //find your location
      {
        const locate = new Locate({
          view: mapView,
          useHeadingEnabled: false,
          goToOverride: function (view: any, options: any) {
            options.target.scale = 1500;
            return view.goTo(options.target);
          }
        });
        mapView.ui.add(locate, "top-left");
      }
      //search widget
      {
        const search = new Search({  //Add Search widget
          view: mapView
        });

        mapView.ui.add(search, "top-right"); //Add to the mapd
      }
      //sketch widget
      {
        const sketch = new Sketch({
          layer: graphicsLayer,
          view: mapView,
          creationMode: "update" // Auto-select
        });

        mapView.ui.add(sketch, "top-right");
      }

    } catch (error) {
      console.error('hata olustu: ' + error);
    }
  }

  goToCoordinate(latitude: string, longitude: string) {
    console.log(latitude);
    console.log(longitude);
    this.mapView.goTo({
      center: [Number(longitude), Number(latitude)],
    })
  }

}
