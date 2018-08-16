
L.Canvas.include({
    _updateMarker6Point: function (layer) {
        if (!this._drawing || layer._empty()) { return; }

        var p = layer._point,
            ctx = this._ctx,
            r = Math.max(Math.round(layer._radius), 6);

        this._drawnLayers[layer._leaflet_id] = layer;

        ctx.beginPath();
        ctx.moveTo(p.x + r     , p.y );
        ctx.lineTo(p.x + 0.43*r, p.y + 0.25 * r);
        ctx.lineTo(p.x + 0.50*r, p.y + 0.87 * r);
        ctx.lineTo(p.x         , p.y + 0.50 * r);
        ctx.lineTo(p.x - 0.50*r, p.y + 0.87 * r);
        ctx.lineTo(p.x - 0.43*r, p.y + 0.25 * r);
        ctx.lineTo(p.x -      r, p.y );
        ctx.lineTo(p.x - 0.43*r, p.y - 0.25 * r);
        ctx.lineTo(p.x - 0.50*r, p.y - 0.87 * r);
        ctx.lineTo(p.x         , p.y - 0.50 * r);
        ctx.lineTo(p.x + 0.50*r, p.y - 0.87 * r);
        ctx.lineTo(p.x + 0.43*r, p.y - 0.25 * r);
        ctx.closePath();
        this._fillStroke(ctx, layer);
    }
});


L.Canvas.include({
    _updateMarkerStar: function (layer) {
        if (!this._drawing || layer._empty()) { return; }

        var p = layer._point,
            ctx = this._ctx,
            r = Math.max(Math.round(layer._radius), 6);

        this._drawnLayers[layer._leaflet_id] = layer;

        ctx.beginPath();
        ctx.moveTo(p.x, p.y + 0.658351875 * r);
        ctx.lineTo(p.x + 0.618027443 * r, p.y + 1 * r);
        ctx.lineTo(p.x + 0.5 * r, p.y + 0.27637816 * r);
        ctx.lineTo(p.x + 1 * r, p.y - 0.236080209 * r);
        ctx.lineTo(p.x + 0.309026865 * r, p.y - 0.341634306 * r);
        ctx.lineTo(p.x + 0 * r, p.y - 1 * r);
        ctx.lineTo(p.x -0.309026865 * r, p.y - 0.341634306 * r);
        ctx.lineTo(p.x -1 * r, p.y - 0.236080209 * r);
        ctx.lineTo(p.x -0.5 * r, p.y + 0.27637816 * r);
        ctx.lineTo(p.x -0.618027443 * r, p.y + 	1 * r);
        ctx.lineTo(p.x, p.y + 0.658351875 * r);
        ctx.closePath();
        this._fillStroke(ctx, layer);

    }
});

L.Canvas.include({
    _updateMarkerDiamond: function (layer) {
        if (!this._drawing || layer._empty()) { return; }

        var p = layer._point,
            ctx = this._ctx,
            r = Math.max(Math.round(layer._radius), 1);

        this._drawnLayers[layer._leaflet_id] = layer;

        ctx.beginPath();
        ctx.moveTo(p.x-r, p.y);
        ctx.lineTo(p.x, p.y-r);
        ctx.lineTo(p.x+r, p.y);
        ctx.lineTo(p.x, p.y+r);
        ctx.lineTo(p.x-r, p.y);
        ctx.closePath();
        this._fillStroke(ctx, layer);
    }
});


L.Canvas.include({
    _updateMarkerSquare: function (layer) {
        if (!this._drawing || layer._empty()) { return; }

        var p = layer._point,
            ctx = this._ctx,
            r = Math.max(Math.round(layer._radius), 1);

        this._drawnLayers[layer._leaflet_id] = layer;

        ctx.beginPath();
        ctx.moveTo(p.x-r, p.y-r);
        ctx.lineTo(p.x+r, p.y-r);
        ctx.lineTo(p.x+r, p.y+r);
        ctx.lineTo(p.x-r, p.y+r);
        ctx.lineTo(p.x-r, p.y-r);
        ctx.closePath();
        this._fillStroke(ctx, layer);
    }
});

L.Canvas.include({
    _updateMarkerTriangleUp: function (layer) {
        if (!this._drawing || layer._empty()) { return; }

        var p = layer._point,
            ctx = this._ctx,
            r = Math.max(Math.round(layer._radius), 1);

        this._drawnLayers[layer._leaflet_id] = layer;

        ctx.beginPath();
        ctx.moveTo(p.x-r, p.y+r);
        ctx.lineTo(p.x, p.y-r);
        ctx.lineTo(p.x+r, p.y+r);
        ctx.closePath();
        this._fillStroke(ctx, layer);
    }
});


L.Canvas.include({
    _updateMarkerTriangleDown: function (layer) {
        if (!this._drawing || layer._empty()) { return; }

        var p = layer._point,
            ctx = this._ctx,
            r = Math.max(Math.round(layer._radius), 1);

        this._drawnLayers[layer._leaflet_id] = layer;

        ctx.beginPath();

        ctx.moveTo(p.x - r, p.y - r);
        ctx.lineTo(p.x, p.y + r);
        ctx.lineTo(p.x + r, p.y - r);
        ctx.closePath();
        this._fillStroke(ctx, layer);
    }
});



L.Canvas.include({
    _updateMarkerTriangleRight: function (layer) {
        if (!this._drawing || layer._empty()) { return; }

        var p = layer._point,
            ctx = this._ctx,
            r = Math.max(Math.round(layer._radius), 1);

        this._drawnLayers[layer._leaflet_id] = layer;

        ctx.beginPath();

        ctx.moveTo(p.x - r, p.y - r);
        ctx.lineTo(p.x+r, p.y);
        ctx.lineTo(p.x - r, p.y + r);
        ctx.closePath();
        this._fillStroke(ctx, layer);
    }
});


L.Canvas.include({
    _updateMarkerTriangleLeft: function (layer) {
        if (!this._drawing || layer._empty()) { return; }

        var p = layer._point,
            ctx = this._ctx,
            r = Math.max(Math.round(layer._radius), 1);

        this._drawnLayers[layer._leaflet_id] = layer;

        ctx.beginPath();

        ctx.moveTo(p.x + r, p.y - r);
        ctx.lineTo(p.x - r, p.y);
        ctx.lineTo(p.x + r, p.y + r);
        ctx.closePath();
        this._fillStroke(ctx, layer);
    }
});


L.Canvas.include({
    _updateMarkerCross: function (layer) {
        if (!this._drawing || layer._empty()) { return; }

        var p = layer._point,
            ctx = this._ctx,
            r = Math.max(Math.round(layer._radius), 6);

        this._drawnLayers[layer._leaflet_id] = layer;

        ctx.beginPath();

        ctx.moveTo(p.x + r, p.y + r);
        ctx.lineTo(p.x - r, p.y - r);
        ctx.lineTo(p.x - r, p.y + r);
        ctx.lineTo(p.x + r, p.y - r);
        ctx.closePath();
        this._fillStroke(ctx, layer);
    }
});

var svgMarker = []; // create an empty array
svgMarker.push({key: "Circle", value: L.CircleMarker});

var MarkerStar = L.CircleMarker.extend({
    _updatePath: function () {
        this._renderer._updateMarkerStar(this);
    }
});
svgMarker.push({key: "Star", value: MarkerStar});


var Marker6Point = L.CircleMarker.extend({
    _updatePath: function () {
        this._renderer._updateMarker6Point(this);
    }
});
svgMarker.push({key: "Star6Pointed", value: Marker6Point});


var MarkerDiamond = L.CircleMarker.extend({
    _updatePath: function () {
        this._renderer._updateMarkerDiamond(this);
    }
});
svgMarker.push({key: "Diamond", value: MarkerDiamond});


var MarkerSquare = L.CircleMarker.extend({
    _updatePath: function () {
        this._renderer._updateMarkerSquare(this);
    }
});
svgMarker.push({key: "Square", value: MarkerSquare});


var MarkerTriangleUp = L.CircleMarker.extend({
    _updatePath: function () {
        this._renderer._updateMarkerTriangleUp(this);
    }
});
svgMarker.push({key: "TriangleUp", value: MarkerTriangleUp});


var MarkerTriangleDown = L.CircleMarker.extend({
    _updatePath: function () {
        this._renderer._updateMarkerTriangleDown(this);
    }
});
svgMarker.push({key: "TriangleDown", value: MarkerTriangleDown});


var MarkerTriangleLeft = L.CircleMarker.extend({
    _updatePath: function () {
        this._renderer._updateMarkerTriangleLeft(this);
    }
});
svgMarker.push({key: "TriangleLeft", value: MarkerTriangleLeft});


var MarkerTriangleRight = L.CircleMarker.extend({
    _updatePath: function () {
        this._renderer._updateMarkerTriangleRight(this);
    }
});
svgMarker.push({key: "TriangleRight", value: MarkerTriangleRight});


var MarkerCross = L.CircleMarker.extend({
    _updatePath: function () {
        this._renderer._updateMarkerCross(this);
    }
});
svgMarker.push({key: "Cross", value: MarkerCross});

