(function(window, document, undefined) {
	
L.IFCircleMask = L.Layer.extend({
	
	initialize: function(marker, radius, state) {
		//tracks a marker by its key, usually m.
		console.log('Init IFCircleMask');
		this._marker = marker;
		this.options.radius = radius;
		this.state = state;
	},
	
	onAdd: function (map) {
		this._map = map;
		this._el = L.DomUtil.create('canvas', 'if-circle-mask');
		var mapSize = map.getSize();
		this._el.width = mapSize.x;
		this._el.height = mapSize.y;
		if (this.state == 'cover') {this._el.style.zIndex = 10;}
		else {this._el.style.zIndex = 5;}
		
		this._ctx = this._el.getContext('2d');
		
		map.getPanes().mapPane.appendChild(this._el);
		
		map.on('viewreset', this._reset, this);
		map.on('resize', this._reset, this);
		console.log(this);
		
		
		if (map.dragging.enabled()) {
			map.dragging._draggable.on('predrag', function() {
				var d = map.dragging._draggable;
				L.DomUtil.setPosition(this._el, { x: -d._newPos.x, y: -d._newPos.y });
				this._reset();
			}, this);		
		}
		
		map.on('move', function() {
			this._reset();
		}, this);		
	},
	
	onRemove: function (map) {
		map.getPanes().mapPane.removeChild(this._el);
		map.off('viewreset', this._reset, this);
		map.off('resize', this._reset, this);
		delete this._marker;
		//remove
	},
	
	_reset: function () {
		console.log('_reset')
		
		if (this._map) {
		L.DomUtil.setPosition(this._el, this._map.containerPointToLayerPoint([0,0]));
		
		var mapSize = this._map.getSize();
		this._el
		this._el.width = mapSize.x;
		this._el.height = mapSize.y;
		}
		this._draw();
	},
	
	_getLatRadius: function () {
        return (this.options.radius / 40075017) * 360;
    },
    
    _getLngRadius: function () {
        return this._getLatRadius() / Math.cos((Math.PI/180) * this._marker.lat);
    },
    
    _getRadius: function () {
	     var lngRadius = this._getLngRadius();
		 var latlng2 = new L.LatLng(this._marker.lat, this._marker.lng - lngRadius),
		 point2 = this._map.latLngToLayerPoint(latlng2),
		 point = this._map.latLngToLayerPoint([this._marker.lat, this._marker.lng]);
		 this._radius = Math.max(Math.round(point.x - point2.x), 1);
		 return this._radius;
    },
	
	_draw: function () {
		console.log('_draw');
		if (this.state==="cover" || this.state==="mask" && this._marker) {
			var c = this._ctx;
			c.clearRect(0,0,c.canvas.width,c.canvas.height);
	
			var point = this._map.latLngToContainerPoint([this._marker.lat, this._marker.lng]);
			c.fillStyle = "rgba(0,0,0,.43)";
			c.beginPath();
			if (this.state==="mask") {
			c.arc(point.x, point.y, this._getRadius(), 0, 2 * Math.PI);
			}
			c.rect(this._el.width, 0, -this._el.width, this._el.height);
			c.fill();
		}
	},
	
	_setState: function(state) {
		this.state = state;
		if (this.state == 'cover') {this._el.style.zIndex = 10;}
		else {this._el.style.zIndex = 5;}
		this._reset();
	}
});

}(window, document));