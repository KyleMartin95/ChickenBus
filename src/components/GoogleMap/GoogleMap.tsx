import {
    IGoogleMap,
    IGoogleMapProps,
    IGoogleMapStyles
} from './GoogleMap.Props';
import { BaseComponent, autobind } from "office-ui-fabric-react/lib/Utilities";
import * as React from "react";
import { getStyles } from './GoogleMap.styles'
import { supportedCountries, IconsForMap } from '../../MockData/FrontEndConsts'
import { Feature, LineString } from "geojson";

interface IStopInfo {
    "coordinates": number[];
}

interface IGoogleMapState {
    activeMarkers?: google.maps.Marker[];
    activeDirectionRenderers?: google.maps.DirectionsRenderer[];
}
const styles: IGoogleMapStyles = getStyles();

export class GoogleMap extends BaseComponent<IGoogleMapProps, IGoogleMapState> implements IGoogleMap {
    private _map: google.maps.Map;
    private _mapCanvas: HTMLDivElement;
    private _geoCoder: google.maps.Geocoder;
    private _directionService: google.maps.DirectionsService;

    constructor(props: IGoogleMapProps) {
        super(props);
        this.state = {
            activeMarkers: [],
            activeDirectionRenderers: []
        };
        this._geoCoder = new google.maps.Geocoder();
    }

    public render() {
        return(
            <div ref={ this._resolveRef("_mapCanvas")} style={ styles.root } id="map"></div>
        )
    }

    public componentDidMount() {
        this._map = new google.maps.Map(this._mapCanvas,
            {
                center: new google.maps.LatLng(12.4150, -85.2362),
                zoom: 7
            }
        );
<<<<<<< HEAD
        this._directionRenderer = new google.maps.DirectionsRenderer();
        this._directionRenderer.setMap(this._map);
        this._directionService = new google.maps.DirectionsService();
=======
        this._directionService = new google.maps.DirectionsService();      
>>>>>>> master
    }

    public componentWillReceiveProps(newProps: IGoogleMapProps): void {
        if(newProps.locationAutocompletes) {
            let activeMarkers: google.maps.Marker[] = [];
            let activeDirectionRenderers: google.maps.DirectionsRenderer[] = [];
            let counter = 0;
            let stops:IStopInfo[] = [];

            /**
             * Call setMap(null) on all rendered features of the google map to clear them
             */
            this.state.activeDirectionRenderers.forEach((directionRenderer)=>directionRenderer.setMap(null));
            this.state.activeMarkers.forEach((marker)=>marker.setMap(null));
            //

            newProps.locationAutocompletes.forEach((autocomplete, index) => {
                let request: google.maps.GeocoderRequest = {
                    address: autocomplete.getPlace().formatted_address,
                    componentRestrictions: { country: supportedCountries[0] },
                }
                this._geoCoder.geocode(request,
                    (results: google.maps.GeocoderResult[], status: google.maps.GeocoderStatus) =>
                        {
                            stops.push({"coordinates": [results[0].geometry.location.lng(), results[0].geometry.location.lat()]})
                            let marker = new google.maps.Marker({
                                // map: this._map,
                                // icon: IconsForMap.origin,
                                position: new google.maps.LatLng(results[0].geometry.location.lat(), results[0].geometry.location.lng())
                            });
                            activeMarkers.push(marker);
                            counter++;
                            if(counter == newProps.locationAutocompletes.length) {
                                let that = this;
                                let originMarker = activeMarkers[0];
                                let destinationMarker = activeMarkers[activeMarkers.length-1];
                                if(newProps.findRoute) {
                                    fetch('/api/routes/find-near?latOrig='+originMarker.getPosition().lat()+'&lngOrig='+originMarker.getPosition().lng()+'&lngDest='+ destinationMarker.getPosition().lng()+'&latDest='+destinationMarker.getPosition().lat()).then((response: any) => {
                                        return response.json();
                                    }).then(function(responseJson){
<<<<<<< HEAD
                                        console.log(responseJson);
                                        //loop through array
=======
>>>>>>> master
                                        originMarker.setMap(that._map);
                                        destinationMarker.setMap(that._map);
                                        console.log(responseJson)
                                        responseJson.forEach((response: any)=>{
                                            let routeRequest: google.maps.DirectionsRequest;
                                            routeRequest = {
                                                origin: new google.maps.LatLng(response.origin[0], response.origin[1]),
                                                destination: new google.maps.LatLng(response.destination[0], response.destination[1]),
                                                travelMode: google.maps.TravelMode.DRIVING
                                            }
                                            that._directionService.route(routeRequest, (res, status) => {
                                                if(status.toString() === 'OK') {
                                                    let directionRenderer: google.maps.DirectionsRenderer = new google.maps.DirectionsRenderer();
                                                    directionRenderer.setMap(that._map);
                                                    directionRenderer.setDirections(res);     
                                                    activeDirectionRenderers.push(directionRenderer);                                               
                                                }
                                            });
                                        });
                                        that.setState({
                                            activeMarkers: activeMarkers,
                                            activeDirectionRenderers: activeDirectionRenderers
                                        });

                                        that._map.fitBounds(originMarker.getPosition().lng() < destinationMarker.getPosition().lng() ?
                                        new google.maps.LatLngBounds(originMarker.getPosition(), destinationMarker.getPosition()) :
                                        new google.maps.LatLngBounds(destinationMarker.getPosition(), originMarker.getPosition()));
                                    }).catch((err)=>{
                                        alert("Could not find a route!");
                                        activeMarkers.forEach((marker)=>marker.setMap(null));
                                    });
                                }else {
                                    let waypoints: google.maps.DirectionsWaypoint[] = []
                                    newProps.locationAutocompletes.slice(1,counter-1).forEach((item)=>{waypoints.push({location: item.getPlace().formatted_address, stopover: false})});
                                    let request: google.maps.DirectionsRequest = {
                                        origin: newProps.locationAutocompletes[0].getPlace().formatted_address,
                                        waypoints: waypoints,
                                        destination: newProps.locationAutocompletes[counter-1].getPlace().formatted_address,
                                        travelMode: google.maps.TravelMode.DRIVING
                                    }
                                    that._directionService.route(request, (res, status) => {
                                        if(status.toString() === 'OK') {
                                            let directionRenderer: google.maps.DirectionsRenderer = new google.maps.DirectionsRenderer();
                                            directionRenderer.setMap(that._map);
                                            directionRenderer.setDirections(res);
                                            this.setState({
                                                activeDirectionRenderers: [directionRenderer]
                                            });
                                        }
                                    });
                                    that._map.fitBounds(originMarker.getPosition().lng() < destinationMarker.getPosition().lng() ?
                                    new google.maps.LatLngBounds(originMarker.getPosition(), destinationMarker.getPosition()) :
                                    new google.maps.LatLngBounds(destinationMarker.getPosition(), originMarker.getPosition()));
                                    if(newProps.storeRoute) {
                                        let route = {
                                            "stops" : stops,
                                            "name": newProps.locationAutocompletes[0].getPlace().name + '-' + newProps.locationAutocompletes[0].getPlace().name,
                                            "cost": 0,
                                            "times": [-1],
                                            "duration": 72,
                                            "notes": "blach blah blach"
                                        }
                                      fetch('/api/routes/create', {
                                        headers: {
                                            'Content-Type': 'application/json'
                                          },
                                          method: 'post',
                                          body: JSON.stringify(route)
                                      }).then((res)=> res.json())
                                    }
                                }
                            }
                        });
            });
        }
    }
}
