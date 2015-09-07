// we assume the typical 8 head-scale for body ratio
// 1. head
// 2. neck -> chest
// [ armpit/breast ]
// 3. ribs
// [ elbows ]
// 4. stomach
// [ crotch ]
// 5. thighs/hands
// 6. leg
// [ knees ]
// 7. shins
// 8. feet
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
    parent.children.push(this);
  },
  moveOriginTo: function(origin) {
    if (this.pivotOffset) {
      this.pivot.mesh.position.x = this.pivotOffset.x + origin.x;
      this.pivot.mesh.position.y = this.pivotOffset.y + origin.y;
      this.pivot.mesh.position.z = this.pivotOffset.z + origin.z;
    } else {
      this.pivot.mesh.position.x = origin.x;
      this.pivot.mesh.position.y = origin.y;
      this.pivot.mesh.position.z = origin.z;
    }
  },
  setNewScale: function(scale) {
    this.mesh.scale.set(scale.x, scale.y, scale.z);

    var delta = scale.clone().sub(this.scale);

    var deltaWidth  = (this.width * delta.x) / 2;
    var deltaHeight = (this.height * delta.y) / 2;
    var deltaDepth  = this.depth * delta.z;

    console.log(this.mesh.scale);

    // change in x/z remain centered
    // change in y -> moving the childpivot directly down by the difference
    console.log(deltaHeight);
    this.mesh.position.y -= deltaHeight;

    if (this.children) {
      _(this.children).each(function(child) { child.pivot.mesh.position.y -= 2 * deltaHeight });
    }

    // shift the child pivots appropriately
    this.scale = scale;
  }
};

function Torso(options) {
  options = options || {};

  this.pivotSize = 0.4;

  this.pelvisSeparation = 1.45;
  this.pivotOffset = new THREE.Vector3(0, this.pelvisSeparation, 0)

  this.width  = options.width  || 2.4;
  this.height = options.height || 1.8;
  this.depth  = options.depth  || 1;

  this.origin = options.origin || new THREE.Vector3();
  this.offset = options.offset || new THREE.Vector3(0, 0.75, 0);
  this.scale  = options.scale  || new THREE.Vector3(1, 1 ,1);

  this.children = [];

  this.mesh = this.createMesh(this.origin, this.offset);
  this.pivot = this.createPivot(this.pivotSize, this.pivotOffset, new THREE.Euler(-Math.PI / 36, 0, 0));
};
Torso.prototype = Object.create(ThreeBodyPart.prototype);
Torso.prototype.constructor = Torso;
Torso.prototype.createMesh = function(origin, offset) {
  // Doesn't matter the coordinates since we are centering on origin anyways
  var p1 = new THREE.Vector2(-this.width / 3, -this.height / 4);
  var p2 = new THREE.Vector2(              0, -this.height / 9); // center point
  var p3 = new THREE.Vector2( this.width / 3, -this.height / 4);
  var p4 = new THREE.Vector2( this.width / 2.5,  this.height / 9);
  var p5 = new THREE.Vector2( this.width / 3,  this.height / 2);
  var p6 = new THREE.Vector2(-this.width / 3,  this.height / 2);
  var p7 = new THREE.Vector2(-this.width / 2.5,  this.height / 9);

  var mesh = new THREE.Mesh(
    new PrismGeometry([p1, p2, p3, p4, p5, p6, p7], this.depth),
    new THREE.MeshLambertMaterial({ shading: THREE.SmoothShading, color: MODEL_COLOR })
  );

  mesh.geometry.center(origin);
  mesh.position.add(offset);

  return mesh;
};
Torso.prototype.setNewScale = function(scale) {
  this.mesh.scale.set(scale.x, scale.y, scale.z);

  var delta = scale.clone().sub(this.scale);

  var deltaWidth  = (this.width * delta.x) / 2;
  var deltaHeight = (this.height * delta.y) / 2;
  var deltaDepth  = this.depth * delta.z;

  console.log(this.mesh.scale);

  // change in x/z remain centered
  // change in y -> moving the childpivot directly down by the difference
  console.log(deltaHeight);
  // this.mesh.position.y += deltaHeight;

  if (this.children) {
    _(this.children).each(function(child) {
      if (child.orientation) child.pivot.mesh.position.x += ((child.orientation === 'L') ? 1 : -1) * deltaWidth;
      child.pivot.mesh.position.y += deltaHeight;
    });
  }
  // shift the child pivots appropriately
  this.scale = scale;
};

function Head(options) {
  options = options || {};

  this.pivotSize = 0.3;

  this.width  = options.width  || 1;
  this.height = options.height || 1.2;
  this.depth  = options.depth  || 1;

  this.origin = options.origin || new THREE.Vector3();
  this.offset = options.offset || new THREE.Vector3(0, this.height / 2, 0);
  this.scale  = options.scale  || new THREE.Vector3(1, 1 ,1);

  this.children = [];

  this.mesh = this.createMesh(this.origin, this.offset);
  this.pivot = this.createPivot(this.pivotSize, new THREE.Vector3(), new THREE.Euler(2 * Math.PI / 36, 0, 0));

  this.attachTo(options.parent);
};
Head.prototype = Object.create(ThreeBodyPart.prototype);
Head.prototype.constructor = Head;
Head.prototype.createMeshx = function(origin, offset) {
  // Make head with a sphere + jaw
  // var mesh = new THREE.Mesh(
  //   new THREE.MeshLambertMaterial({ shading: THREE.SmoothShading, color: MODEL_COLOR })
  // );

  // Jaw: a mask made of a 6-point polyhedron
  // We want the radius - position of the start of the jaw
  // Math.cos(angle) = adj/hyp
  var initialWidth = Math.abs(Math.cos(30 * Math.PI/36) * this.width);
  var initialHeight = Math.abs(Math.sin(45 * Math.PI/36) * (this.width * this.width - initialWidth * initialWidth)); // wrong
  var initialDepth = Math.sqrt((this.width * this.width) - (initialWidth * initialWidth) - (initialHeight * initialHeight));
  // depth can be calculated from equation of a sphere: x^2 + y^2 + z^2 = R^2
  // z = sqrt(R^2 - x^2 - y^2)
  var noseDepth = Math.sqrt((this.width * this.width) - (initialHeight * initialHeight));

  // debugPivot.position.set(initialWidth, -initialHeight, initialDepth);
  // debugPivot.position.set(-initialWidth, -initialHeight, initialDepth);
  // debugPivot.position.set(0, -initialHeight, noseDepth);
  // debugPivot.position.set(0.6 * initialWidth, 4 * -initialHeight, 2 * initialDepth);
  // debugPivot.position.set(0, 6 * -initialHeight, noseDepth);
  // debugPivot.position.set(0.6 * -initialWidth, 4 * -initialHeight, 2 * initialDepth);

  // attachment point needs to have the depth ON the sphere
  var jawVertices = [
          -initialWidth, -initialHeight, initialDepth,
                      0, -initialHeight, noseDepth, // nose
           initialWidth, -initialHeight, initialDepth,

     0.6 * initialWidth, 4 * -initialHeight, 2 * initialDepth,
                      0, 6 * -initialHeight, noseDepth, // chin
    0.6 * -initialWidth, 4 * -initialHeight, 2 * initialDepth
  ];

  console.log(jawVertices);

  // Faces have to be triangles, so we have 5
  var jawFaces = [
    5,4,1,
    5,1,0,
    2,1,3,
    4,3,1,
    0,1,2,
    0,4,5,
    2,3,4
  ];

  // var sphere = new THREE.SphereGeometry(this.width, 16, 16);
  var jaw = new THREE.PolyhedronGeometry(jawVertices, jawFaces, this.width, 0);

  // jaw.merge(sphere);

  var mesh = new THREE.Mesh(
    jaw,
    new THREE.MeshLambertMaterial({ shading: THREE.SmoothShading, color: MODEL_COLOR, wireframe: true })
  );

  mesh.position.z += 2;

  var debugPivot = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 20, 20),
    new THREE.MeshLambertMaterial({ shading: THREE.SmoothShading, color: MODEL_COLOR })
  );

  debugPivot.position.set(initialWidth, -initialHeight, initialDepth);
  mesh.add(debugPivot);

  debugPivot = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 20, 20),
    new THREE.MeshLambertMaterial({ shading: THREE.SmoothShading, color: MODEL_COLOR })
  );
  debugPivot.position.set(-initialWidth, -initialHeight, initialDepth);
  mesh.add(debugPivot);

  debugPivot = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 20, 20),
    new THREE.MeshLambertMaterial({ shading: THREE.SmoothShading, color: MODEL_COLOR })
  );
  debugPivot.position.set(0, -initialHeight, noseDepth);
  mesh.add(debugPivot);

  debugPivot = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 20, 20),
    new THREE.MeshLambertMaterial({ shading: THREE.SmoothShading, color: MODEL_COLOR })
  );
  debugPivot.position.set(0.6 * initialWidth, 4 * -initialHeight, 2 * initialDepth);
  mesh.add(debugPivot);

  debugPivot = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 20, 20),
    new THREE.MeshLambertMaterial({ shading: THREE.SmoothShading, color: MODEL_COLOR })
  );
  debugPivot.position.set(0, 6 * -initialHeight, noseDepth);
  mesh.add(debugPivot);

  debugPivot = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 20, 20),
    new THREE.MeshLambertMaterial({ shading: THREE.SmoothShading, color: MODEL_COLOR })
  );
  debugPivot.position.set(0.6 * -initialWidth, 4 * -initialHeight, 2 * initialDepth);
  mesh.add(debugPivot);

  // mesh.geometry.center(origin);
  // mesh.position.add(offset);

  return mesh;
};
Head.prototype.attachTo = function(parent) {
  var pivotDiff = (parent.pivot.size - this.pivotSize) / 2;
  var offset = new THREE.Vector3(0, pivotDiff + parent.height, 0);

  this.pivot.mesh.position.add(offset);
  parent.pivot.mesh.add(this.pivot.mesh);
  parent.children.push(this);
};
Head.prototype.setNewScale = function(scale) {
  this.mesh.scale.set(scale.x, scale.y, scale.z);

  var delta = scale.clone().sub(this.scale);

  var deltaWidth  = (this.width * delta.x) / 2;
  var deltaHeight = (this.height * delta.y) / 2;
  var deltaDepth  = this.depth * delta.z;

  console.log(this.mesh.scale);

  // change in x/z remain centered
  // change in y -> moving the childpivot directly down by the difference
  console.log(deltaHeight);
  this.mesh.position.y += deltaHeight;

  // shift the child pivots appropriately
  this.scale = scale;
};

function UpperArm(options) {
  options = options || {};

  this.pivotSize = 0.4;

  this.width  = options.width  || 0.5;
  this.height = options.height || 1.8;
  this.depth  = options.depth  || 0.6;

  this.origin = options.origin || new THREE.Vector3();
  this.offset = options.offset || new THREE.Vector3(0, -this.height / 2, 0);
  this.scale  = options.scale  || new THREE.Vector3(1, 1 ,1);
  this.orientation = options.orientation;

  this.children = [];

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
  parent.children.push(this);
};

function Arm(options) {
  options = options || {};

  this.pivotSize = 0.4;

  this.width  = options.width  || 0.6;
  this.height = options.height || 2;
  this.depth  = options.depth  || 0.5;

  this.origin = options.origin || new THREE.Vector3();
  this.offset = options.offset || new THREE.Vector3(0, -this.height / 2, 0);
  this.scale  = options.scale  || new THREE.Vector3(1, 1 ,1);

  this.children = [];

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
Arm.prototype.setNewScale = function(scale) {
  this.mesh.scale.set(scale.z, scale.y, scale.x);

  var delta = scale.clone().sub(this.scale);

  var deltaWidth  = (this.width * delta.x) / 2;
  var deltaHeight = (this.height * delta.y) / 2;
  var deltaDepth  = this.depth * delta.z;

  console.log(this.mesh.scale);

  // change in x/z remain centered
  // change in y -> moving the childpivot directly down by the difference
  console.log(deltaHeight);
  this.mesh.position.y -= deltaHeight;
  if (this.children) {
    _(this.children).each(function(child) { child.pivot.mesh.position.y -= 2 * deltaHeight });
  }

  // shift the child pivots appropriately
  this.scale = scale;
};

function Hand(options) {
  options = options || {};

  this.pivotSize = 0.3;

  this.width  = options.width  || 0.25;
  this.height = options.height || 0.75;
  this.depth  = options.depth  || 0.5;

  this.origin = options.origin || new THREE.Vector3();
  this.offset = options.offset || new THREE.Vector3(0, -this.height / 2, 0);
  this.scale  = options.scale  || new THREE.Vector3(1, 1 ,1);

  this.children = [];

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
  this.scale  = options.scale  || new THREE.Vector3(1, 1 ,1);

  this.children = [];

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
Pelvis.prototype.setNewScale = function(scale) {
  this.mesh.scale.set(scale.x, scale.y, scale.z);

  var delta = scale.clone().sub(this.scale);

  var deltaWidth  = (this.width * delta.x) / 2;
  var deltaHeight = (this.height * delta.y) / 2;
  var deltaDepth  = this.depth * delta.z;

  console.log(this.mesh.scale);

  // change in x/z remain centered
  // change in y -> moving the childpivot directly down by the difference
  console.log(deltaHeight);

  if (this.children) {
    _(this.children).each(function(child) {
      if (child.orientation) child.pivot.mesh.position.x += ((child.orientation === 'L') ? 1 : -1) * deltaWidth;
      child.pivot.mesh.position.y += deltaHeight;
    });
  }
  // shift the child pivots appropriately
  this.scale = scale;
};

function Thigh(options) {
  options = options || {};

  this.pivotSize = 0.65;

  this.width  = options.width  || 1;
  this.height = options.height || 2.5;
  this.depth  = options.depth  || 0.7;

  this.origin = options.origin || new THREE.Vector3();
  this.offset = options.offset || new THREE.Vector3(0, -this.height / 2, 0);
  this.scale  = options.scale  || new THREE.Vector3(1, 1 ,1);
  this.orientation = options.orientation;

  this.children = [];

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
  parent.children.push(this);
};
Thigh.prototype.setNewScale = function(scale) {
  this.mesh.scale.set(scale.z, scale.y, scale.x);

  var delta = scale.clone().sub(this.scale);

  var deltaWidth  = (this.width * delta.x) / 2;
  var deltaHeight = (this.height * delta.y) / 2;
  var deltaDepth  = this.depth * delta.z;

  console.log(this.mesh.scale);

  // change in x/z remain centered
  // change in y -> moving the childpivot directly down by the difference
  console.log(deltaHeight);
  this.mesh.position.y -= deltaHeight;
  if (this.children) {
    _(this.children).each(function(child) { child.pivot.mesh.position.y -= 2 * deltaHeight });
  }

  // shift the child pivots appropriately
  this.scale = scale;
};

function Leg(options) {
  options = options || {};

  this.pivotSize = 0.45;

  this.width  = options.width  || 0.75;
  this.height = options.height || 2.5;
  this.depth  = options.depth  || 0.7;

  this.origin = options.origin || new THREE.Vector3();
  this.offset = options.offset || new THREE.Vector3(0, -this.height / 2, -0.1);
  this.scale  = options.scale  || new THREE.Vector3(1, 1 ,1);

  this.children = [];

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
Leg.prototype.setNewScale = function(scale) {
  this.mesh.scale.set(scale.z, scale.y, scale.x);

  var delta = scale.clone().sub(this.scale);

  var deltaWidth  = (this.width * delta.x) / 2;
  var deltaHeight = (this.height * delta.y) / 2;
  var deltaDepth  = this.depth * delta.z;

  console.log(this.mesh.scale);

  // change in x/z remain centered
  // change in y -> moving the childpivot directly down by the difference
  console.log(deltaHeight);
  this.mesh.position.y -= deltaHeight;
  if (this.children) {
    _(this.children).each(function(child) { child.pivot.mesh.position.y -= 2 * deltaHeight });
  }

  // shift the child pivots appropriately
  this.scale = scale;
};

function Feet(options) {
  options = options || {};

  this.pivotSize = 0.4;

  this.width  = options.width  || 0.75;
  this.height = options.height || 0.3;
  this.depth  = options.depth  || 1.2;

  this.origin = options.origin || new THREE.Vector3();
  this.offset = options.offset || new THREE.Vector3(0, -this.height / 2, 0.4);
  this.scale  = options.scale  || new THREE.Vector3(1, 1 ,1);

  this.children = [];

  this.mesh = this.createMesh(this.origin, this.offset, new THREE.Euler(0, Math.PI / 2, 0));
  this.pivot = this.createPivot(this.pivotSize, new THREE.Vector3(), new THREE.Euler());

  this.attachTo(options.parent, new THREE.Vector3(0, -2.5, 0));
};
Feet.prototype = Object.create(ThreeBodyPart.prototype);
Feet.prototype.constructor = Feet;
