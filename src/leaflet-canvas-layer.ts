// tslint:disable-next-line:no-reference
///<reference path='./leaflet-canvas-layer.d.ts'/>

/*
  1.0.1 (downloaded from https://github.com/Sumbera/gLayers.Leaflet/releases/tag/v1.0.1)

  Generic  Canvas Layer for leaflet 0.7 and 1.0-rc,
  copyright Stanislav Sumbera,  2016 , sumbera.com , license MIT
  originally created and motivated by L.CanvasOverlay  available here: https://gist.github.com/Sumbera/11114288
*/

import { Browser, DomUtil, LatLng, Layer, LayerOptions, LeafletEventHandlerFn, Map, ResizeEvent, Util, ZoomAnimEvent } from 'leaflet'

export class CanvasLayer extends Layer {
    protected _canvas: HTMLCanvasElement
    protected _map: Map

    private _delegate: any
    private _frame: any

    // -- initialized is called on prototype
    constructor(options?: LayerOptions) {
        super(options)
        this._map = null
        this._canvas = null
        this._frame = null
        this._delegate = null
    }

    // -------------------------------------------------------------
    public getEvents() {
        const events: { [index: string]: LeafletEventHandlerFn } = {
            // resize: this._onLayerDidResize,
            moveend: this._onLayerDidMove,
        }
        if (this._map.options.zoomAnimation && Browser.any3d) {
            events.zoomanim = this._animateZoom
        }

        return events
    }
    // -------------------------------------------------------------
    public onAdd(map: Map) {
        this._map = map
        this._canvas = DomUtil.create('canvas', 'leaflet-layer') as HTMLCanvasElement

        const size = this._map.getSize()
        this._canvas.width = size.x
        this._canvas.height = size.y

        const animated = this._map.options.zoomAnimation && Browser.any3d
        DomUtil.addClass(this._canvas, 'leaflet-zoom-' + (animated ? 'animated' : 'hide'))

        map.getPanes().overlayPane.appendChild(this._canvas)

        const del = this._delegate || this
        if (del.onLayerDidMount) { del.onLayerDidMount() } // -- callback

        this.needRedraw()
        return this
    }

    // -------------------------------------------------------------
    public onRemove(map: Map) {
        const del = this._delegate || this
        if (del.onLayerWillUnmount) { del.onLayerWillUnmount() } // -- callback

        map.getPanes().overlayPane.removeChild(this._canvas)

        this._canvas = null
        return this
    }

    public needRedraw() {
        if (!this._frame) {
            this._frame = Util.requestAnimFrame(this.drawLayer, this)
        }
        return this
    }

    public delegate(del: any) {
        this._delegate = del
        return this
    }

    // -------------------------------------------------------------
    private _onLayerDidResize(resizeEvent: ResizeEvent) {
        this._canvas.width = resizeEvent.newSize.x
        this._canvas.height = resizeEvent.newSize.y
    }
    // -------------------------------------------------------------
    private _onLayerDidMove() {
        const topLeft = this._map.containerPointToLayerPoint([0, 0])
        DomUtil.setPosition(this._canvas, topLeft)
        this.drawLayer()
    }

    // --------------------------------------------------------------------------------
    private LatLonToMercator(latlon: LatLng) {
        return {
            x: latlon.lng * 6378137 * Math.PI / 180,
            y: Math.log(Math.tan((90 + latlon.lat) * Math.PI / 360)) * 6378137
        }
    }

    // ------------------------------------------------------------------------------
    private drawLayer() {
        // -- todo make the viewInfo properties  flat objects.
        const _size = this._map.getSize()
        this._canvas.width = _size.x
        this._canvas.height = _size.y
        const _bounds = this._map.getBounds()
        const _zoom = this._map.getZoom()

        const _center = this.LatLonToMercator(this._map.getCenter())
        const _corner = this.LatLonToMercator(this._map.containerPointToLatLng(this._map.getSize()))

        const del = this._delegate || this
        if (del.onDrawLayer) {
            del.onDrawLayer({
                bounds: _bounds,
                canvas: this._canvas,
                center: _center,
                corner: _corner,
                layer: this,
                size: _size,
                zoom: _zoom
            })
        }
        this._frame = null
    }

    // ------------------------------------------------------------------------------
    private _animateZoom(e: ZoomAnimEvent) {
        const scale = e.target.getZoomScale(e.zoom, e.target.getZoom())
        const offset = this._map._latLngBoundsToNewLayerBounds(this._map.getBounds(), e.zoom, e.center).min
        DomUtil.setTransform(this._canvas, offset, scale)
    }
}
