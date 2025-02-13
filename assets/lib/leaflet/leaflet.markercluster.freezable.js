/*!
 Leaflet.MarkerCluster.Freezable 1.0.0+9db80a3
 (c) 2015-2016 Boris Seang
 License MIT
 */
!(function (e, i) {
  "function" == typeof define && define.amd
    ? define(["leaflet"], i)
    : i("object" == typeof module && module.exports ? require("leaflet") : e.L);
})(this, function (e, i) {
  e.MarkerClusterGroup.include({
    _originalOnAddFreezable: e.MarkerClusterGroup.prototype.onAdd,
    onAdd: function (e) {
      var i = this._zoom;
      this._originalOnAddFreezable(e),
        this._frozen &&
          (i >= 0 &&
            i !== this._zoom &&
            (this._featureGroup.clearLayers(),
            (this._zoom = i),
            this.addLayers([])),
          e.off("zoomend", this._zoomEnd, this),
          e.off("moveend", this._moveEnd, this),
          e.on("zoomend moveend", this._viewChangeEndNotClustering, this));
    },
    _originalOnRemove: e.MarkerClusterGroup.prototype.onRemove,
    onRemove: function (e) {
      e.off("zoomend moveend", this._viewChangeEndNotClustering, this),
        this._originalOnRemove(e);
    },
    disableClustering: function () {
      return this.freezeAtZoom(this._maxZoom + 1);
    },
    disableClusteringKeepSpiderfy: function () {
      return this.freezeAtZoom(this._maxZoom);
    },
    enableClustering: function () {
      return this.unfreeze();
    },
    unfreeze: function () {
      return this.freezeAtZoom(!1);
    },
    freezeAtZoom: function (e) {
      this._processQueue();
      var o = this._map;
      e === i || e === !0 || e !== e
        ? (e = o ? Math.round(o.getZoom()) : -1)
        : "max" === e
        ? (e = this._maxZoom + 1)
        : "maxKeepSpiderfy" === e && (e = this._maxZoom);
      var t = "number" == typeof e;
      if (this._frozen) {
        if (!t) return this._unfreeze(), this;
      } else {
        if (!t) return this;
        this._initiateFreeze();
      }
      return this._artificialZoomSafe(this._zoom, e), this;
    },
    _initiateFreeze: function () {
      var e = this._map;
      (this._frozen = !0),
        e &&
          (e.off("zoomend", this._zoomEnd, this),
          e.off("moveend", this._moveEnd, this),
          e.on("zoomend moveend", this._viewChangeEndNotClustering, this));
    },
    _unfreeze: function () {
      var e = this._map;
      (this._frozen = !1),
        e &&
          (e.off("zoomend moveend", this._viewChangeEndNotClustering, this),
          e.on("zoomend", this._zoomEnd, this),
          e.on("moveend", this._moveEnd, this),
          this._executeAfterUnspiderfy(function () {
            this._zoomEnd();
          }, this));
    },
    _executeAfterUnspiderfy: function (e, i) {
      return this._unspiderfy && this._spiderfied
        ? (this.once("animationend", function () {
            e.call(i);
          }),
          void this._unspiderfy())
        : void e.call(i);
    },
    _artificialZoomSafe: function (e, i) {
      (this._zoom = i),
        this._map &&
          e !== i &&
          this._executeAfterUnspiderfy(function () {
            this._artificialZoom(e, i);
          }, this);
    },
    _artificialZoom: function (e, i) {
      e < i
        ? (this._animationStart(),
          this._topClusterLevel._recursivelyRemoveChildrenFromMap(
            this._currentShownBounds,
            this._map.getMinZoom(),
            e,
            this._getExpandedVisibleBounds()
          ),
          this._animationZoomIn(e, i))
        : e > i && (this._animationStart(), this._animationZoomOut(e, i));
    },
    _viewChangeEndNotClustering: function () {
      var e = this._featureGroup,
        i = this._getExpandedVisibleBounds(),
        o = this._zoom;
      e.eachLayer(function (t) {
        !i.contains(t._latlng) &&
          t.__parent &&
          t.__parent._zoom < o &&
          e.removeLayer(t);
      }),
        this._topClusterLevel._recursively(
          i,
          -1,
          o,
          function (t) {
            if (t._zoom !== o)
              for (var n, r = t._markers, s = 0; s < r.length; s++)
                (n = t._markers[s]), i.contains(n._latlng) && e.addLayer(n);
          },
          function (e) {
            e._addToMap();
          }
        ),
        (this._currentShownBounds = i);
    },
    _originalZoomOrSpiderfy: e.MarkerClusterGroup.prototype._zoomOrSpiderfy,
    _zoomOrSpiderfy: function (e) {
      this._frozen && this.options.spiderfyOnMaxZoom
        ? (e.layer.spiderfy(),
          e.originalEvent &&
            13 === e.originalEvent.keyCode &&
            map._container.focus())
        : this._originalZoomOrSpiderfy(e);
    },
  });
});
