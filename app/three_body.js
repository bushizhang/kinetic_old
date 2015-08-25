// TODO: Clean up the inheritance here
function Pivot(size, object) {
  this.size = size;
  this.mesh = new THREE.Mesh(
    new THREE.SphereGeometry(size, 20, 20),
    new THREE.MeshLambertMaterial({ shading: THREE.SmoothShading, color: MODEL_COLOR })
  );

  this.mesh.add(object);
};

function PivotHelper(pivot) {
  this.size = pivot.size * 2;
  this.mesh = new THREE.Mesh(
    new THREE.SphereGeometry(pivot.size / 5, 20, 20),
    new THREE.MeshBasicMaterial({
      color: MODEL_SELECTED
    })
  );

  var axis1 = new THREE.Geometry();
  axis1.vertices.push(
    new THREE.Vector3(pivot.size / 2.5, 0, 0),
    new THREE.Vector3(pivot.size / 2.5, 0, 0),
    new THREE.Vector3(5, 0, 0)
  );

  var axis2 = new THREE.Geometry();
  axis2.vertices.push(
    new THREE.Vector3(0, pivot.size / 2.5, 0),
    new THREE.Vector3(0, pivot.size / 2.5, 0),
    new THREE.Vector3(0, 5, 0)
  );

  var axis3 = new THREE.Geometry();
  axis3.vertices.push(
    new THREE.Vector3(0, 0, pivot.size / 2.5),
    new THREE.Vector3(0, 0, pivot.size / 2.5),
    new THREE.Vector3(0, 0, 5)
  );

  var material = new THREE.LineBasicMaterial({ color: MODEL_SELECTED });
  this.mesh.add(new THREE.Line(axis1, material));
  this.mesh.add(new THREE.Line(axis2, material));
  this.mesh.add(new THREE.Line(axis3, material));

  var worldPos = pivot.mesh.getWorldPosition();
  var worldRot = pivot.mesh.getWorldRotation();

  this.mesh.position.set(worldPos.x, worldPos.y, worldPos.z);
  this.mesh.rotation.x = worldRot.x;
  this.mesh.rotation.y = worldRot.y;
  this.mesh.rotation.z = worldRot.z;
};

function ThreeBodyPart() {};
ThreeBodyPart.prototype = {
  // TODO: refactor to support prismgeometry construction by defining a geometry lookup
  createMesh: function(origin, offset) {
    var mesh = new THREE.Mesh(
      new THREE.BoxGeometry(this.width, this.height, this.depth),
      new THREE.MeshLambertMaterial({ shading: THREE.SmoothShading, color: MODEL_COLOR })
    );

    mesh.geometry.center(origin);
    mesh.position.add(offset);
    return mesh;
  },
  createPivot: function(size, offset, rotation) {
    var pivot = new Pivot(size, this.mesh);
    pivot.mesh.position.add(offset);
    pivot.mesh.rotation.set(rotation.x, rotation.y, rotation.z);
    return pivot;
  },
  attachTo: function(parent, offset) {
    this.pivot.mesh.position.add(offset);
    parent.pivot.mesh.add(this.pivot.mesh);
  }
};

function Torso(options) {
  options = options || {};

  this.pivotSize = 0.5;
  this.pelvisSeparation = 1.5;

  this.width  = options.width  || 2.4;
  this.height = options.height || 1.8;
  this.depth  = options.depth  || 1;
  this.origin = options.origin || new THREE.Vector3();
  this.offset = options.offset || new THREE.Vector3(0, this.pivotSize, 0);

  this.mesh = this.createMesh(this.origin, this.offset);
  this.pivot = this.createPivot(this.pivotSize, new THREE.Vector3(0, this.pelvisSeparation, 0), new THREE.Euler(-Math.PI / 36, 0, 0));
};
Torso.prototype = Object.create(ThreeBodyPart.prototype);
Torso.prototype.constructor = Torso;
Torso.prototype.createMesh = function(origin, offset) {
  // Doesn't matter the coordinates since we are centering on origin anyways
  var p1 = new THREE.Vector2(-this.width / 3, -this.height / 2);
  var p2 = new THREE.Vector2(              0, -this.height / 9); // center point
  var p3 = new THREE.Vector2( this.width / 3, -this.height / 2);
  var p4 = new THREE.Vector2( this.width / 2,  this.height / 9);
  var p5 = new THREE.Vector2( this.width / 3,  this.height / 2);
  var p6 = new THREE.Vector2(-this.width / 3,  this.height / 2);
  var p7 = new THREE.Vector2(-this.width / 2,  this.height / 9);

  var mesh = new THREE.Mesh(
    new PrismGeometry([p1, p2, p3, p4, p5, p6, p7], this.depth),
    new THREE.MeshLambertMaterial({ shading: THREE.SmoothShading, color: MODEL_COLOR })
  );

  mesh.geometry.center(origin);
  mesh.position.add(offset);

  return mesh;
};

function Head(options) {
  options = options || {};

  this.pivotSize = 0.3;
  this.width  = options.width  || 1;
  this.height = options.height || 1.2;
  this.depth  = options.depth  || 1;
  this.origin = options.origin || new THREE.Vector3();
  this.offset = options.offset || new THREE.Vector3(0, this.height / 2, 0);

  this.mesh = this.createMesh(this.origin, this.offset);
  this.pivot = this.createPivot(this.pivotSize, new THREE.Vector3(), new THREE.Euler(2 * Math.PI / 36, 0, 0));

  this.attachTo(options.parent);
};
Head.prototype = Object.create(ThreeBodyPart.prototype);
Head.prototype.constructor = Head;
Head.prototype.attachTo = function(parent) {
  var pivotDiff = (parent.pivot.size - this.pivotSize) / 2;
  var offset = new THREE.Vector3(0, pivotDiff + parent.height, 0);

  this.pivot.mesh.position.add(offset);
  parent.pivot.mesh.add(this.pivot.mesh);
};

function UpperArm(options) {
  options = options || {};

  this.pivotSize = 0.4;
  this.width  = options.width  || 0.5;
  this.height = options.height || 1.8;
  this.depth  = options.depth  || 0.6;
  this.origin = options.origin || new THREE.Vector3();
  this.offset = options.offset || new THREE.Vector3(0, -this.height / 2, 0);
  this.orientation = options.orientation;

  this.mesh = this.createMesh(this.origin, this.offset);
  this.pivot = this.createPivot(this.pivotSize, new THREE.Vector3(), new THREE.Euler(2 * Math.PI / 36, 0, 0));

  this.attachTo(options.parent);
};
UpperArm.prototype = Object.create(ThreeBodyPart.prototype);
UpperArm.prototype.constructor = UpperArm;
UpperArm.prototype.attachTo = function(parent) {
  var orientation = (this.orientation === 'L') ? 1 : -1;
  var offset = new THREE.Vector3(orientation * (parent.width / 2), (parent.height / 3 * 2), 0);

  this.pivot.mesh.rotateZ(orientation * Math.PI / 36);
  this.pivot.mesh.position.add(offset);
  parent.pivot.mesh.add(this.pivot.mesh);
};

function Arm(options) {
  options = options || {};

  this.pivotSize = 0.4;
  this.width  = options.width  || 0.6;
  this.height = options.height || 2;
  this.depth  = options.depth  || 0.5;
  this.origin = options.origin || new THREE.Vector3();
  this.offset = options.offset || new THREE.Vector3(0, -this.height / 2, 0);

  this.mesh = this.createMesh(this.origin, this.offset, new THREE.Euler(0, Math.PI / 2, 0));
  this.pivot = this.createPivot(this.pivotSize, new THREE.Vector3(), new THREE.Euler(-2 * Math.PI / 36, 0, 0));

  this.attachTo(options.parent, new THREE.Vector3(0, -1.9, 0));
};
Arm.prototype = Object.create(ThreeBodyPart.prototype);
Arm.prototype.constructor = Arm;
Arm.prototype.createMesh = function(origin, offset, rotation) {
  var p1 = new THREE.Vector2(-this.width / 2, this.height / 2);
  var p2 = new THREE.Vector2( this.width / 2, this.height / 2);
  var p3 = new THREE.Vector2(              0, -1);
  var p4 = new THREE.Vector2(-this.width / 2, -this.height / 2);

  var mesh = new THREE.Mesh(
    new PrismGeometry([p1, p2, p3, p4], this.depth),
    new THREE.MeshLambertMaterial({ shading: THREE.SmoothShading, color: MODEL_COLOR })
  );

  mesh.geometry.center(origin);
  mesh.position.add(offset);
  mesh.rotation.set(rotation.x, rotation.y, rotation.z);

  return mesh;
};

function Hand(options) {
  options = options || {};

  this.pivotSize = 0.3;
  this.width  = options.width  || 0.25;
  this.height = options.height || 0.75;
  this.depth  = options.depth  || 0.5;
  this.origin = options.origin || new THREE.Vector3();
  this.offset = options.offset || new THREE.Vector3(0, -this.height / 2, 0);

  this.mesh = this.createMesh(this.origin, this.offset, new THREE.Euler(0, Math.PI / 2, 0));
  this.pivot = this.createPivot(this.pivotSize, new THREE.Vector3(), new THREE.Euler(-2 * Math.PI / 36, 0, 0));

  this.attachTo(options.parent, new THREE.Vector3(0, -2, 0.15));
};
Hand.prototype = Object.create(ThreeBodyPart.prototype);
Hand.prototype.constructor = Hand;

function Pelvis(options) {
  options = options || {};

  this.pivotSize = 0.4;
  this.width  = options.width  || 1.8;
  this.height = options.height || 1.2;
  this.depth  = options.depth  || 0.8;
  this.origin = options.origin || new THREE.Vector3();
  this.offset = options.offset || new THREE.Vector3(0, -this.height / 3, 0);

  this.mesh = this.createMesh(this.origin, this.offset);
  this.pivot = this.createPivot(this.pivotSize, new THREE.Vector3(), new THREE.Euler());
};
Pelvis.prototype = Object.create(ThreeBodyPart.prototype);
Pelvis.prototype.constructor = Pelvis;
Pelvis.prototype.createMesh = function(origin, offset) {
  var p1 = new THREE.Vector2(    -this.width / 2, 3 * this.height / 4);
  var p2 = new THREE.Vector2(-4 * this.width / 9, 11 * this.height / 12);
  var p3 = new THREE.Vector2( 4 * this.width / 9, 11 * this.height / 12);
  var p4 = new THREE.Vector2(     this.width / 2, 3 * this.height / 4);
  var p5 = new THREE.Vector2( 2 * this.width / 9, this.height / 2);
  var p6 = new THREE.Vector2(    this.width / 18, 0);
  var p7 = new THREE.Vector2(   -this.width / 18, 0);
  var p8 = new THREE.Vector2(-2 * this.width / 9, this.height / 2);

  var mesh = new THREE.Mesh(
    new PrismGeometry([p1, p2, p3, p4, p5, p6, p7, p8], this.depth),
    new THREE.MeshLambertMaterial({ shading: THREE.SmoothShading, color: MODEL_COLOR })
  );

  mesh.geometry.center(origin);
  mesh.position.add(offset);

  return mesh;
};

function Thigh(options) {
  options = options || {};

  this.pivotSize = 0.65;
  this.width  = options.width  || 1;
  this.height = options.height || 2.5;
  this.depth  = options.depth  || 0.7;
  this.origin = options.origin || new THREE.Vector3();
  this.offset = options.offset || new THREE.Vector3(0, -this.height / 2, 0);
  this.orientation = options.orientation;

  this.mesh = this.createMesh(this.origin, this.offset, new THREE.Euler(0, Math.PI / 2, 0));
  this.pivot = this.createPivot(this.pivotSize, new THREE.Vector3(), new THREE.Euler(Math.PI / 36, 0, 0));

  this.attachTo(options.parent);
};
Thigh.prototype = Object.create(ThreeBodyPart.prototype);
Thigh.prototype.constructor = Thigh;
Thigh.prototype.createMesh = function(origin, offset, rotation) {
  var p1 = new THREE.Vector2(-this.width / 2,  this.height / 2);
  var p2 = new THREE.Vector2( this.width / 2,  this.height / 2);
  var p3 = new THREE.Vector2(            0.0, -this.height / 2);
  var p4 = new THREE.Vector2(-this.width / 2, -this.height / 2);

  var mesh = new THREE.Mesh(
    new PrismGeometry([p1, p2, p3, p4], this.depth),
    new THREE.MeshLambertMaterial({ shading: THREE.SmoothShading, color: MODEL_COLOR })
  );

  mesh.geometry.center(origin);
  mesh.position.add(offset);
  mesh.rotation.set(rotation.x, rotation.y, rotation.z);

  return mesh;
};
Thigh.prototype.attachTo = function(parent) {
  var orientation = (this.orientation === 'L') ? 1 : -1;
  var offset = new THREE.Vector3(orientation * 3.25 * parent.width / 9, -3.25 * parent.width / 9, -0.15);
  this.pivot.mesh.position.add(offset);
  parent.pivot.mesh.add(this.pivot.mesh);
};

function Leg(options) {
  options = options || {};

  this.pivotSize = 0.45;
  this.width  = options.width  || 0.75;
  this.height = options.height || 2.5;
  this.depth  = options.depth  || 0.7;
  this.origin = options.origin || new THREE.Vector3();
  this.offset = options.offset || new THREE.Vector3(0, -this.height / 2, -0.1);

  this.mesh = this.createMesh(this.origin, this.offset, new THREE.Euler(0, Math.PI / 2, 0));
  this.pivot = this.createPivot(this.pivotSize, new THREE.Vector3(), new THREE.Euler(-Math.PI / 36, 0, 0));

  this.attachTo(options.parent, new THREE.Vector3(0, -2.5, 0.25));
};
Leg.prototype = Object.create(ThreeBodyPart.prototype);
Leg.prototype.constructor = Leg;
Leg.prototype.createMesh = function(origin, offset, rotation) {
  var p1 = new THREE.Vector2(   -this.width / 3, this.height);
  var p2 = new THREE.Vector2(    this.width / 3, this.height);
  var p3 = new THREE.Vector2(2 * this.width / 3, 3 * this.height / 5);
  var p4 = new THREE.Vector2(    this.width / 5, 0);
  var p5 = new THREE.Vector2(   -this.width / 3, 0);
  var points = [p1, p2, p3, p4, p5];

  var mesh = new THREE.Mesh(
    new PrismGeometry(points, this.depth),
    new THREE.MeshLambertMaterial({ shading: THREE.SmoothShading, color: MODEL_COLOR })
  );

  mesh.geometry.center(origin);
  mesh.position.add(offset);
  mesh.rotation.set(rotation.x, rotation.y, rotation.z);

  return mesh;
};

function Feet(options) {
  options = options || {};

  this.pivotSize = 0.4;
  this.width  = options.width  || 0.75;
  this.height = options.height || 0.3;
  this.depth  = options.depth  || 1.2;
  this.origin = options.origin || new THREE.Vector3();
  this.offset = options.offset || new THREE.Vector3(0, -this.height / 2, 0.4);

  this.mesh = this.createMesh(this.origin, this.offset, new THREE.Euler(0, Math.PI / 2, 0));
  this.pivot = this.createPivot(this.pivotSize, new THREE.Vector3(), new THREE.Euler());

  this.attachTo(options.parent, new THREE.Vector3(0, -2.5, 0));
};
Feet.prototype = Object.create(ThreeBodyPart.prototype);
Feet.prototype.constructor = Feet;
