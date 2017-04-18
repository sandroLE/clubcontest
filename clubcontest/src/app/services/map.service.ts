import { Observable } from 'rxjs/Observable';
import { IFlight, ILoggerPoint } from './../models/flight';
import { GeoUtilService } from './geoUtil.service';
import { ITask, ITaskPoint } from './../models/task';
import { Http } from '@angular/http';
import { Injectable, EventEmitter } from '@angular/core';
import 'rxjs/add/operator/takeUntil';

@Injectable()
export class MapService {

  private _map: L.Map;
  public get map() { return this._map }
  private taskLayer: L.Polyline;
  private observationZoneLayer: L.LayerGroup;
  private flightLayerGroup: L.LayerGroup;
  private insertedTaskPoint: ITaskPoint = null;
  private taskEditEvents: EventEmitter<void> = new EventEmitter<void>();
  constructor(private geoUtil: GeoUtilService) {
    this.flightLayerGroup = L.layerGroup([]);
  }

  public createMap(domElementId: string): L.Map {
    var mapOptions: L.MapOptions = { zoomControl: false, preferCanvas: false };
    (<any>mapOptions).editable = true;
    this._map = L.map(domElementId, mapOptions)
      .setView([51.3952778, 12.5380556], 9);
    L.control.zoom({ position: 'bottomright' }).addTo(this._map);
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this._map);
    //L.tileLayer('http://prosoar.de/airspace/{z}/{x}/{y}.png', { attribution: "prosoar.de" }).addTo(this.map);
    L.tileLayer('https://skylines.aero/mapproxy/tiles/1.0.0/airspace+airports/{z}/{x}/{y}.png', {  }).addTo(this.map);
    
    this.flightLayerGroup.addTo(this._map);
    return this._map;
  }

  public showTask(task: ITask, editable = false) {
    this.stopEditMode();
    this.clearTask();
    if (task == null) {
      return;
    }
    this.observationZoneLayer = this.createObservationZoneLayers(task, editable);
    this.observationZoneLayer.addTo(this._map)
    this.taskLayer = this.createTaskLayer(task);
    this.taskLayer.addTo(this._map);

    if (editable) {
      this.startEditMode(task);
    }
  }



  public clearTask() {
    if (this.taskLayer) {
      this.map.removeLayer(this.taskLayer)
    }
    if (this.observationZoneLayer) {
      this._map.removeLayer(this.observationZoneLayer);
    }
  }



  private createTaskLayer(task: ITask): L.Polyline {
    if (task == null) {
      return;
    }
    var points = task.TaskPoints.map((x) => {
      return <L.LatLngExpression>[x.Latitude, x.Longitude]
    });
    var polyline = L.polyline(points);
    return polyline;
  }



  private createObservationZoneLayers(task: ITask, editable: boolean) {
    var editables = [];
    var layerGroup = L.layerGroup([]);
    task.TaskPoints.forEach((tp, index) => {
      var layer: L.Layer = null;
      var editLayer: any = null;

      if (tp.Type == "Start" && tp.ObservationZone.Type == "Line") {
        layer = this.geoUtil.createStartLine(task, this._map);
        if (editable) {
          editLayer = this.createCircle(tp, true);
          editables.push(editLayer);
        }
      }
      else if (tp.Type == "Finish" && tp.ObservationZone.Type == "Line") {
        layer = this.geoUtil.createFinishLine(task, this._map);
        if (editable) {
          editLayer = this.createCircle(tp, true);
          editables.push(editLayer);
        }

      }
      else if (tp.ObservationZone.Type == "Cylinder") {
        layer = this.createCircle(tp);
        if (editable) {
          editables.push(layer);
        }
      }
      else if (tp.ObservationZone.Type == "Keyhole") {
        //layer = this.createKeyhole(task, index);

        layer = this.createSector(this.map, task, index);
      }
      else {
        throw "not supported observation zone ";
      }

      layerGroup.addLayer(layer);

      if (editLayer != null) {
        layerGroup.addLayer(editLayer);
      }
    });
    layerGroup.addTo(this.map);
    editables.forEach((x) => {
      x.enableEdit();
    })
    return layerGroup;
  }


  private createCircle(taskPoint: ITaskPoint, isEditableStyle = false): L.Layer {
    var options: L.CircleOptions = { radius: taskPoint.ObservationZone.Radius || taskPoint.ObservationZone.Length / 2 };
    if (isEditableStyle) {
      options.color = "yellow";
      options.opacity = 0.3;
    }
    var circle = L.circle([taskPoint.Latitude, taskPoint.Longitude], options);
    return circle;
  }


  private createSector(map: L.Map, task: ITask, index: number) {
    //sector direction
    var prev = task.TaskPoints[index - 1];
    var tp = task.TaskPoints[index];
    var next = task.TaskPoints[index + 1];
    var prevTp = new Victor(tp.Latitude - prev.Latitude, tp.Longitude - prev.Longitude);
    var tpNext = new Victor(tp.Latitude - next.Latitude, tp.Longitude - next.Longitude);
    prevTp.normalize();
    tpNext.normalize();
    var vector = prevTp.add(tpNext);
    var direction = vector.angleDeg();
    //sector borders
    var LGeometryUtil: any = (<any>L).GeometryUtil;
    var t1 = L.latLng(task.TaskPoints[index].Latitude, task.TaskPoints[index].Longitude);
    var t2 = LGeometryUtil.destination(t1, direction, 10000);   
    var leftPoint: L.LatLng = LGeometryUtil.rotatePoint(map, t2, -45, t1);
    var rightPoint: L.LatLng = LGeometryUtil.rotatePoint(map, t2, +45, t1);
    var semicircle = this.createKeyhole(task, index);  
    return semicircle;
  }


  private createKeyhole(task: ITask, index: number): L.Layer {
    var LGeometryUtil: any = (<any>L).GeometryUtil;
    var prev = task.TaskPoints[index - 1];
    var tp = task.TaskPoints[index];
    var next = task.TaskPoints[index + 1];
    var prevTp = new Victor(tp.Latitude - prev.Latitude, tp.Longitude - prev.Longitude);
    var tpNext = new Victor(tp.Latitude - next.Latitude, tp.Longitude - next.Longitude);

    prevTp.normalize();
    tpNext.normalize();

    var s = prevTp.add(tpNext);
    var tpLatLng = L.latLng(tp.Latitude, tp.Longitude);   
    var semicircle: any = L.circle(tpLatLng, { radius: 10000 });
    semicircle.setDirection(s.angleDeg(), 90);


    return semicircle;

  }


  private flightLayers: { [id: number]: L.LayerGroup } = {};


  public addFlight(flight: IFlight, color:string, updateCache = false): L.Layer {
    if (flight == null) {
      return;
    }
    if (this.flightLayers[flight.Id] == null || updateCache) {
      this.flightLayers[flight.Id] = this.createFlightLayer(flight, color);
    }
    var flightLayer = this.flightLayers[flight.Id];
    this.flightLayerGroup.addLayer(flightLayer)
  }


  private createFlightLayer(flight: IFlight, color:string): L.LayerGroup {
    var points = (<any[]>flight.Points).map((x) => {
      return [x.Latitude, x.Longitude]
    });
    var polyline = L.polyline(points, { color: color });
    let flightLGroup = L.layerGroup([polyline]);

    if (flight.turnPoints != null) {
      flight.turnPoints.filter(x => x != null).forEach((x: ILoggerPoint) => {
        flightLGroup.addLayer(L.marker(L.latLng(x.Latitude, x.Longitude)));
      });
    }
    return flightLGroup;
  }


  public clearFlights() {
    this.flightLayerGroup.clearLayers();
  }

  public clearMap() {
    this.clearFlights();
    this.clearTask();
  }

  /* flight point editor */
  private almostOverMarker: L.Marker = null;

  private almostOverClickObs: Observable<any> = null;

  public almostOverClick(): Observable<any> {
    if (this.almostOverClickObs == null) {
      this.almostOverClickObs = Observable.fromEvent(this._map, "almost:click");
    }
    return this.almostOverClickObs;
  }


  public setAlmostOverMarker(latlng: L.LatLngExpression): void {
    if (!this.almostOverMarker) {
      this.almostOverMarker = L.marker(latlng);
      this.almostOverMarker.addTo(this._map);
    }
    this.almostOverMarker.setLatLng(latlng);
  }


  public almostOverMove(flight: IFlight): Observable<any> {
    var flightLayer = this.flightLayers[flight.Id];
    var m = <any>this._map;
    m.almostOver.addLayer(flightLayer);
    var obs = Observable.fromEvent(m, "almost:move");
    obs.takeUntil(this.almostOverClick()).subscribe((e: any) => {
      //subscribe just for remove layer on complete 
    }
      , (err) => alert(err)
      , () => {
        console.log("MapService::almostOverMove::completed");
        m.almostOver.removeLayer(flightLayer)
      });
    return obs;
  }


  /* Task editor */
  private startEditMode(task: ITask) {

    this.unbindAllEditEvents();
    (<any>this).taskLayer.enableEdit();
    this._map.on('editable:drawing:move', e => this.onTaskEdit(e, task));
    this._map.on('editable:vertex:deleted', e => this.onTaskPointDeleted(e, task));
    this._map.on('editable:vertex:click', (e: any) => this.onVertexClicked(e, task));
    this._map.on('editable:vertex:dragend', (e: any) => this.onVertexDragEnd(e, task));
    this._map.on('editable:middlemarker:mousedown', (e: any) => this.onMiddleMarkerMouseDown(e,task));
  }

  private onVertexClicked(e: any, task: ITask) {
    if (e.layer instanceof (<any>L).Circle) {
      e.canel();
      return;
    }
    var index = this.getTaskPointIndex(e.vertex.getLatLng(), task);
    console.log("editable:vertex:click", index);
    if (index < 1 || index >= task.TaskPoints.length - 1) {
      e.cancel();
    }
  }


  private onMiddleMarkerMouseDown(e: any, task:ITask) {    
    this.insertedTaskPoint = {
      Index: 0,
      Latitude: e.latlng.lat,
      Longitude: e.latlng.lng,
      Name: "WP",
      ObservationZone: { 
        Length: 0, 
        Radius: 1000, 
        Type: task.Type == "AAT" ? "Cylinder" : "Keyhole" 
      },
      Type: task.Type == "AAT" ? "Area" : "Turn"
    }
  }


  private onVertexDragEnd(e, task: ITask) {   
    if (e.layer instanceof (<any>L).Circle) {
      var latLng = e.layer.getLatLng(); //the center of the circle
      var index = this.getTaskPointIndex(latLng, task);
      if (index >= 0) {
        var radius = e.layer.getRadius();
        task.TaskPoints[index].ObservationZone.Radius = Math.floor(radius / 1000) * 1000;
        task.TaskPoints[index].ObservationZone.Length = Math.floor(radius / 1000) * 2000;
        this.repaintObservationZoneLayerOnEdit(task);
        this.taskEditEvents.next();
      }
    }
    this.bringTaskLayerToFront();
  }


  private getTaskPointIndex(latLng: L.LatLng, task): number {
    var index = task.TaskPoints.findIndex(x => latLng.lat == x.Latitude && latLng.lng == x.Longitude);
    return index;
  }


  public getTaskEditEvents(): Observable<void> {
    return this.taskEditEvents.asObservable();
  }


  private onTaskEdit(e: any, task: ITask) {
    if (e.layer instanceof (<any>L).Polyline) {
      var i = e.vertex.getIndex();
      if (this.insertedTaskPoint != null) {
        task.TaskPoints.splice(i, 0, this.insertedTaskPoint);
        this.insertedTaskPoint = null;
      }
      task.TaskPoints[i].Latitude = e.latlng.lat;
      task.TaskPoints[i].Longitude = e.latlng.lng;
      this.repaintObservationZoneLayerOnEdit(task);
      this.taskEditEvents.next();
    }
  }



  private repaintObservationZoneLayerOnEdit(task: ITask) {
    this.observationZoneLayer.remove();
    this.observationZoneLayer = this.createObservationZoneLayers(task, true);
    this.observationZoneLayer.addTo(this._map);
  }


  private onTaskPointDeleted(e: any, task: ITask) {
    var index = task.TaskPoints.findIndex(x => x.Latitude == e.vertex.latlng.lat && x.Longitude == e.vertex.latlng.lng);
    if (index > 0 && index < task.TaskPoints.length - 1) {
      task.TaskPoints.splice(index, 1);
      this.repaintObservationZoneLayerOnEdit(task);
      setTimeout(() => this.bringTaskLayerToFront(), 100);
    }
    else {
      debugger;
    }
  }


  private bringTaskLayerToFront() {
    (<any>this).taskLayer.disableEdit();
    (<any>this).taskLayer.enableEdit();
  }

  public stopEditMode() {
    this.unbindAllEditEvents();
  }

  private unbindAllEditEvents() {
    this._map.off('editable:drawing:move');
    this._map.off('editable:vertex:deleted');
    this._map.off('editable:vertex:click');
    this._map.off('editable:vertex:dragend');
    this._map.off('editable:middlemarker:mousedown');
    this.insertedTaskPoint = null;
  }
}

class TaskLayer {

}
declare var Victor;