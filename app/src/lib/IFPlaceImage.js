L.IFPlaceImage = L.Layer.extend({

	options: {
		opacity: 1,
		alt: ''
	},

	initialize: function (url, marker, options) { // (String, LatLngBounds, Object)
		this._url = url;
		this._marker = marker;
		this.scale = 1;
		this.eScale = 1;
		this.on('load', this._imgLoaded, this);
		
		L.setOptions(this, options);
	},

	onAdd: function () {
		console.log('getEvents');
		if (!this._image) {
			this._initImage();

			if (this.options.opacity < 1) {
				this._updateOpacity();
			}
		}

		this.getPane().appendChild(this._image);

		this._reset();
	},

	onRemove: function () {
		L.DomUtil.remove(this._image);
	},

	setOpacity: function (opacity) {
		this.options.opacity = opacity;

		if (this._image) {
			this._updateOpacity();
		}
		return this;
	},

	bringToFront: function () {
		if (this._map) {
			L.DomUtil.toFront(this._image);
		}
		return this;
	},

	bringToBack: function () {
		if (this._map) {
			L.DomUtil.toBack(this._image);
		}
		return this;
	},

	setUrl: function (url) {
		console.log('setUrl');
		this._url = url;

		if (this._image) {
			this._image.src = url;
		}
		return this;
	},

	getAttribution: function () {
		return this.options.attribution;
	},

	getEvents: function () {
		console.log('getEvents');
		var events = {
			viewreset: this._reset
		};

		if (this._zoomAnimated) {
			events.zoomanim = this._animateZoom;
		}

		return events;
	},
	
	getBounds: function() {
		console.log('getBounds');
		return this._bounds;
	},

	_initImage: function () {
		console.log('_initImage');
		var img = this._image = L.DomUtil.create('img',
				'leaflet-image-layer ' + (this._zoomAnimated ? 'leaflet-zoom-animated' : ''));
					
		img.onselectstart = L.Util.falseFn;
		img.onmousemove = L.Util.falseFn;

		img.onload = L.bind(this.fire, this, 'load');
		img.src = this._url;
		img.alt = this.options.alt;
	},
	
	setScale: function(i) {
		console.log('setScale');
		if (!this.loaded) {return false}
		this.scale = i;
		
		
		this._reset();
	},
	
	_imgLoaded: function () {
		console.log('_imgLoaded');
		console.log(this._marker)
		var img = this._image;
		this.loaded = true;
		this._naturalWidth = img.width;
		this._naturalHeight = img.height;
		console.log(this);
		var xoffset = this._naturalWidth*this.scale/2,
			yoffset = this._naturalHeight*this.scale/2,
			center = this._map.latLngToLayerPoint([this._marker.lat, this._marker.lng]);
		console.log(xoffset, yoffset, center);
		this.bounds = L.bounds(
					[center.x-xoffset, center.y-yoffset],
					[center.x+xoffset, center.y+yoffset]);
		//this.bounds = L.bounds([0,0],[this._naturalWidth, this._naturalHeight]);
			var southWest = this._map.layerPointToLatLng(L.point(this.bounds.min.x, this.bounds.max.y)),
				northEast = this._map.layerPointToLatLng(L.point(this.bounds.max.x, this.bounds.min.y));
		this._bounds = L.latLngBounds(southWest, northEast);
		console.log(this.bounds, southWest, northEast, this._bounds);
	
		this._reset();
	},

	_animateZoom: function (e) {
	console.log('_animateZoom');
	/*var topLeft = this._map._latLngToNewLayerPoint(this._bounds.getNorthWest(), e.zoom, e.center),
		    size = this._map._latLngToNewLayerPoint(this._bounds.getSouthEast(), e.zoom, e.center).subtract(topLeft),
		    offset = topLeft.add(size._multiplyBy((1 - 1 / e.scale) / 2));
		console.log(topLeft, size, offset);*/
		//L.DomUtil.setTransform(this._image, offset, e.scale);
		//L.DomUtil.setPosition(image, offset);
		this.eScale = this.eScale*e.scale;
		
		console.log(this);
	},

	_reset: function () {
		console.log('_reset');
		if (this.loaded) {
		var image = this._image;
		
		var xoffset = this._naturalWidth*this.scale/2,
			yoffset = this._naturalHeight*this.scale/2,
			center = this._map.latLngToLayerPoint([this._marker.lat, this._marker.lng]);
		this.bounds = L.bounds(
					[center.x-xoffset, center.y-yoffset],
					[center.x+xoffset, center.y+yoffset]);
		//this.bounds = L.bounds([0,0],[this._naturalWidth, this._naturalHeight]);
			var southWest = this._map.layerPointToLatLng(L.point(this.bounds.min.x, this.bounds.max.y)),
				northEast = this._map.layerPointToLatLng(L.point(this.bounds.max.x, this.bounds.min.y));
		this._bounds = L.latLngBounds(southWest, northEast);
		console.log(this.bounds, southWest, northEast, this._bounds);
		
		
		var xoffset_zoomed = xoffset*this.eScale,
			yoffset_zoomed = yoffset*this.eScale,
			bounds_zoomed = L.bounds(
					[center.x-xoffset_zoomed, center.y-yoffset_zoomed],
					[center.x+xoffset_zoomed, center.y+yoffset_zoomed]),
			size = bounds_zoomed.getSize();
		

		L.DomUtil.setPosition(image, bounds_zoomed.min);

		image.style.width  = size.x + 'px';
		image.style.height = size.y + 'px';
		}
	},

	_updateOpacity: function () {
		L.DomUtil.setOpacity(this._image, this.options.opacity);
	}
});