// building prisms using a shape + extrude geometry
// http://alexan0308.github.io/threejs/examples/#webgl_geometry_PrismGeometry
PrismGeometry = function(vertices, height) {
  var Shape = new THREE.Shape();
  (function f(ctx) {
    // start from the first
    ctx.moveTo(vertices[0].x, vertices[0].y);

    for (var i=1; i < vertices.length; i++) {
      ctx.lineTo(vertices[i].x, vertices[i].y);
    }

    // complete the shape
    ctx.lineTo(vertices[0].x, vertices[0].y);
  })(Shape);

  var settings = {};
  settings.amount = height;
  settings.bevelEnabled = false;

  THREE.ExtrudeGeometry.call(this, Shape, settings);
};
PrismGeometry.prototype = Object.create(THREE.ExtrudeGeometry.prototype);
