import { Map } from 'leaflet'
declare module 'leaflet' {
    interface Map {
        public _latLngBoundsToNewLayerBounds(ll: LatLngBounds, z: number, c: LatLng): Bounds

    }
}
