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

function BodyPart() {};
BodyPart.prototype = {
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
  // TODO: Move attach logic into object creation?
  attach: function(childPivot, offset) {
    childPivot.mesh.position.add(offset);
    this.pivot.mesh.add(childPivot.mesh);
  }
};

function Torso(options) {
  options = options || {};

  // CONSTANTS
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
Torso.prototype = Object.create(BodyPart.prototype);
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
Torso.prototype.attach = function(childPivot, type) {
  if (type === 'head') {
    var pivotDiff = (this.pivotSize - childPivot.size) / 2;
    var offset = new THREE.Vector3(0, pivotDiff + this.height, 0);
  } else {
    var orientation = (type === 'upperArmL') ? 1 : -1;
    var offset = new THREE.Vector3(orientation * (this.width / 2), (this.height / 3 * 2), 0);
    childPivot.mesh.rotateZ(orientation * Math.PI / 36);
  };

  childPivot.mesh.position.add(offset);
  this.pivot.mesh.add(childPivot.mesh);
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
};
Head.prototype = Object.create(BodyPart.prototype);
Head.prototype.constructor = Head;

function UpperArm(options) {
  options = options || {};

  this.pivotSize = 0.4;
  this.width  = options.width  || 0.5;
  this.height = options.height || 1.8;
  this.depth  = options.depth  || 0.6;
  this.origin = options.origin || new THREE.Vector3();
  this.offset = options.offset || new THREE.Vector3(0, -this.height / 2, 0);

  this.mesh = this.createMesh(this.origin, this.offset);
  this.pivot = this.createPivot(this.pivotSize, new THREE.Vector3(), new THREE.Euler(2 * Math.PI / 36, 0, 0));
};
UpperArm.prototype = Object.create(BodyPart.prototype);
UpperArm.prototype.constructor = UpperArm;

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
};
Arm.prototype = Object.create(BodyPart.prototype);
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
};
Hand.prototype = Object.create(BodyPart.prototype);
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
Pelvis.prototype = Object.create(BodyPart.prototype);
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
Pelvis.prototype.attach = function(childPivot, type) {
  var orientation = (type === 'thighL') ? 1 : -1;
  childPivot.mesh.position.add(new THREE.Vector3(orientation * 3.25 * this.width / 9, -3.25 * this.width / 9, -0.15));
  this.pivot.mesh.add(childPivot.mesh);
};

function Thigh(options) {
  options = options || {};

  this.pivotSize = 0.65;
  this.width  = options.width  || 1;
  this.height = options.height || 2.5;
  this.depth  = options.depth  || 0.7;
  this.origin = options.origin || new THREE.Vector3();
  this.offset = options.offset || new THREE.Vector3(0, -this.height / 2, 0);

  this.mesh = this.createMesh(this.origin, this.offset, new THREE.Euler(0, Math.PI / 2, 0));
  this.pivot = this.createPivot(this.pivotSize, new THREE.Vector3(), new THREE.Euler(Math.PI / 36, 0, 0));
};
Thigh.prototype = Object.create(BodyPart.prototype);
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
};
Leg.prototype = Object.create(BodyPart.prototype);
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
};
Feet.prototype = Object.create(BodyPart.prototype);
Feet.prototype.constructor = Feet;

function Body() {
  this.initTopComponents();
  this.initBottomComponents();

  // since intersection uses the object mesh, we need to keep a hash of the objects' mesh ids for easy lookup
  this.initMeshLookup();
};

// TODO: rewrite the offsets relative to the body parts instead of these
Body.prototype = {
  initTopComponents: function() {
    this.torso  = new Torso();
    this.head   = new Head();
    this.upperArmL = new UpperArm();
    this.upperArmR = new UpperArm();;
    this.armL = new Arm();
    this.armR = new Arm();
    this.handL = new Hand();
    this.handR = new Hand();

    this.torso.attach(this.head.pivot, 'head');
    this.torso.attach(this.upperArmL.pivot, 'upperArmL');
    this.torso.attach(this.upperArmR.pivot, 'upperArmR');

    this.upperArmL.attach(this.armL.pivot, new THREE.Vector3(0, -1.9, 0));
    this.upperArmR.attach(this.armR.pivot, new THREE.Vector3(0, -1.9, 0));

    this.armL.attach(this.handL.pivot, new THREE.Vector3(0, -2, 0.15));
    this.armR.attach(this.handR.pivot, new THREE.Vector3(0, -2, 0.15));
  },

  initBottomComponents: function() {
    this.pelvis = new Pelvis();
    this.thighL = new Thigh();
    this.thighR = new Thigh();
    this.legL   = new Leg();
    this.legR   = new Leg();
    this.feetL  = new Feet();
    this.feetR  = new Feet();

    this.pelvis.attach(this.thighL.pivot, 'thighL');
    this.pelvis.attach(this.thighR.pivot, 'thighR');

    this.thighL.attach(this.legL.pivot, new THREE.Vector3(0, -2.5, 0.25));
    this.thighR.attach(this.legR.pivot, new THREE.Vector3(0, -2.5, 0.25));

    this.legL.attach(this.feetL.pivot, new THREE.Vector3(0, -2.5, 0));
    this.legR.attach(this.feetR.pivot, new THREE.Vector3(0, -2.5, 0));
  },

  initMeshLookup: function() {
    this.objectFromMeshId = {};
    this.objectFromMeshId[this.head.mesh.id]   = this.head;
    this.objectFromMeshId[this.torso.mesh.id]  = this.torso;
    this.objectFromMeshId[this.upperArmL.mesh.id] = this.upperArmL;
    this.objectFromMeshId[this.upperArmR.mesh.id] = this.upperArmR;
    this.objectFromMeshId[this.armL.mesh.id] = this.armL;
    this.objectFromMeshId[this.armR.mesh.id] = this.armR;
    this.objectFromMeshId[this.handL.mesh.id] = this.handL;
    this.objectFromMeshId[this.handR.mesh.id] = this.handR;

    this.objectFromMeshId[this.pelvis.mesh.id] = this.pelvis;
    this.objectFromMeshId[this.thighL.mesh.id] = this.thighL;
    this.objectFromMeshId[this.thighR.mesh.id] = this.thighR;
    this.objectFromMeshId[this.legL.mesh.id]   = this.legL;
    this.objectFromMeshId[this.legR.mesh.id]   = this.legR;
    this.objectFromMeshId[this.feetL.mesh.id]  = this.feetL;
    this.objectFromMeshId[this.feetR.mesh.id]  = this.feetR;
  }
};