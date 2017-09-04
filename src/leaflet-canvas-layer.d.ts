import { Map } from 'leaflet'
declare module 'leaflet' {
    interface Map {
        _latLngBoundsToNewLayerBounds(ll: LatLngBounds, z: number, c: LatLng): Bounds

    }
}
