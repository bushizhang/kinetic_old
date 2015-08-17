// TODO: Clean up the inheritance here
function Pivot(size, object) {
  this.mesh = new THREE.Mesh(
    new THREE.SphereGeometry(size, 20, 20),
    new THREE.MeshLambertMaterial({ shading: THREE.SmoothShading, color: 0x474747, emissive: 0x858585 })
  );

  this.mesh.add(object);
};

function Torso() {
  var p1 = new THREE.Vector2(-0.9, -0.75);
  var p2 = new THREE.Vector2(0, -0.25);
  var p3 = new THREE.Vector2(0.9, -0.75);
  var p4 = new THREE.Vector2(1.15, 0.25);
  var p5 = new THREE.Vector2(0.9, 1);
  var p6 = new THREE.Vector2(-0.9, 1);
  var p7 = new THREE.Vector2(-1.15, 0.25);
  var height = 1;

  this.mesh = new THREE.Mesh(
    new PrismGeometry([p1, p2, p3, p4, p5, p6, p7], height),
    new THREE.MeshLambertMaterial({ shading: THREE.SmoothShading, color: 0x474747, emissive: 0x858585 })
  );
  this.mesh.position.z -= 0.5;
  this.mesh.position.y += 0.5;

  this.pivot = new Pivot(0.5, this.mesh);
  this.pivot.mesh.position.y += 1.5;
  this.pivot.mesh.rotateX(- Math.PI / 36);
};
Torso.prototype.attach = function(childPivot, type) {
  if (type === 'head') {
    childPivot.mesh.position.y += 2;
  } else {
    var orientation = (type === 'upperArmL') ? 1 : -1;
    childPivot.mesh.position.x += orientation * 1.35;
    childPivot.mesh.position.y += 1.1;

    childPivot.mesh.rotateZ(orientation * Math.PI / 36);
  }

  this.pivot.mesh.add(childPivot.mesh);
};

function Head() {
  this.mesh = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1.2, 1),
    new THREE.MeshLambertMaterial({ shading: THREE.SmoothShading, color: 0x474747, emissive: 0x858585 })
  );
  this.mesh.position.y += 0.6;

  this.pivot = new Pivot(0.3, this.mesh);
  this.pivot.mesh.rotateX(2 * Math.PI / 36);
};

function UpperArm() {
  this.mesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 1.8, 0.6),
    new THREE.MeshLambertMaterial({ shading: THREE.SmoothShading, color: 0x474747, emissive: 0x858585 })
  );
  this.mesh.position.y -= 0.9;

  this.pivot = new Pivot(0.4, this.mesh);
  this.pivot.mesh.rotateX(2 * Math.PI / 36);
};
UpperArm.prototype.attach = function(childPivot) {
  this.pivot.mesh.add(childPivot.mesh);
  childPivot.mesh.position.y -= 1.9;
};

function Arm() {
  var p1 = new THREE.Vector2(-0.3, 1);
  var p2 = new THREE.Vector2(0.3, 1);
  var p3 = new THREE.Vector2(0, -1);
  var p4 = new THREE.Vector2(-0.3, -1);
  var height = 0.5;

  this.mesh = new THREE.Mesh(
    new PrismGeometry([p1, p2, p3, p4], height),
    new THREE.MeshLambertMaterial({ shading: THREE.SmoothShading, color: 0x474747, emissive: 0x858585 })
  );
  this.mesh.rotation.y += Math.PI / 2;
  this.mesh.position.x -= 0.25;
  this.mesh.position.y -= 1;

  this.pivot = new Pivot(0.4, this.mesh);
  this.pivot.mesh.rotateX(-2 * Math.PI / 36);
};
Arm.prototype.attach = function(childPivot) {
  this.pivot.mesh.add(childPivot.mesh);
  childPivot.mesh.position.y -= 2;
  childPivot.mesh.position.z += 0.15;
};

function Hand() {
  this.mesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.25, 0.75, 0.5),
    new THREE.MeshLambertMaterial({ shading: THREE.SmoothShading, color: 0x474747, emissive: 0x858585 })
  );
  this.mesh.position.y -= 0.5;

  this.pivot = new Pivot(0.3, this.mesh);
  this.pivot.mesh.rotateX(-2 * Math.PI / 36);
};

function Pelvis() {
  var p1 = new THREE.Vector2(-0.9, 0.9);
  var p2 = new THREE.Vector2(-0.8, 1.1);
  var p3 = new THREE.Vector2(0.8, 1.1);
  var p4 = new THREE.Vector2(0.9, 0.9);
  var p5 = new THREE.Vector2(0.4, 0.65);
  var p6 = new THREE.Vector2(0.1, 0);
  var p7 = new THREE.Vector2(-0.1, 0);
  var p8 = new THREE.Vector2(-0.4, 0.65);
  var height = 0.8;

  this.mesh = new THREE.Mesh(
    new PrismGeometry([p1, p2, p3, p4, p5, p6, p7, p8], height),
    new THREE.MeshLambertMaterial({ shading: THREE.SmoothShading, color: 0x474747, emissive: 0x858585 })
  );
  this.mesh.position.z -= height * 0.5;
  this.mesh.position.y -= 1;

  this.pivot = new Pivot(0.4, this.mesh);
}
Pelvis.prototype.attach = function(childPivot, type) {
  var orientation = (type === 'thighL') ? 1 : -1;
  childPivot.mesh.position.x += orientation * 0.65;
  childPivot.mesh.position.y -= 0.65;
  childPivot.mesh.position.z -= 0.15;

  this.pivot.mesh.add(childPivot.mesh);
}

function Thigh() {
  var p1 = new THREE.Vector2(-0.5, 1.25);
  var p2 = new THREE.Vector2(0.5, 1.25);
  var p3 = new THREE.Vector2(0.0, -1.25);
  var p4 = new THREE.Vector2(-0.5, -1.25);
  var height = 0.7;

  this.mesh = new THREE.Mesh(
    new PrismGeometry([p1, p2, p3, p4], height),
    new THREE.MeshLambertMaterial({ shading: THREE.SmoothShading, color: 0x474747, emissive: 0x858585 })
  );
  this.mesh.rotation.y += Math.PI / 2;
  this.mesh.position.x -= 0.35;
  this.mesh.position.y -= 1.25;

  this.pivot = new Pivot(0.65, this.mesh);
  this.pivot.mesh.rotateX(Math.PI / 36);
};
Thigh.prototype.attach = function(childPivot) {
  this.pivot.mesh.add(childPivot.mesh);
  childPivot.mesh.position.y -= 2.5;
  childPivot.mesh.position.z += 0.25;
}

function Leg() {
  var p1 = new THREE.Vector2(-0.25, 1.5);
  var p2 = new THREE.Vector2(0.25, 1.5);
  var p3 = new THREE.Vector2(0.5, 0.5);
  var p4 = new THREE.Vector2(0.15, -1);
  var p5 = new THREE.Vector2(-0.25, -1);
  var points = [p1, p2, p3, p4, p5];
  var height = 0.7;

  this.mesh = new THREE.Mesh(
    new PrismGeometry(points, height),
    new THREE.MeshLambertMaterial({ shading: THREE.SmoothShading, color: 0x474747, emissive: 0x858585 })
  );
  this.mesh.rotation.y += Math.PI / 2;
  this.mesh.position.x -= 0.35;
  this.mesh.position.y -= 1.5;

  this.pivot = new Pivot(0.45, this.mesh);
  this.pivot.mesh.rotateX(- Math.PI / 36);
};
Leg.prototype.attach = function(childPivot) {
  this.pivot.mesh.add(childPivot.mesh);
  childPivot.mesh.position.y -= 2.5;
};

function Feet() {
  this.mesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.75, 0.3, 1.2),
    new THREE.MeshLambertMaterial({ shading: THREE.SmoothShading, color: 0x474747, emissive: 0x858585 })
  );
  this.mesh.position.y -= 0.275;
  this.mesh.position.z += 0.4;

  this.pivot = new Pivot(0.4, this.mesh);
};

function Body() {
  this.initTopComponents();
  this.initBottomComponents();

  // since intersection uses the object mesh, we need to keep a hash of the objects' mesh ids for easy lookup
  this.initMeshLookup();
};

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

    this.upperArmL.attach(this.armL.pivot);
    this.upperArmR.attach(this.armR.pivot);

    this.armL.attach(this.handL.pivot);
    this.armR.attach(this.handR.pivot);
  },

  initBottomComponents: function() {
    this.pelvis = new Pelvis();
    this.thighL = new Thigh();
    this.thighR = new Thigh();
    this.legL   = new Leg();
    this.legR   = new Leg();
    this.feetL  = new Feet();
    this.feetR  = new Feet();

    // TODO: Move attach logic into object creation?
    this.pelvis.attach(this.thighL.pivot, 'thighL');
    this.pelvis.attach(this.thighR.pivot, 'thighR');

    this.thighL.attach(this.legL.pivot);
    this.thighR.attach(this.legR.pivot);

    this.legL.attach(this.feetL.pivot);
    this.legR.attach(this.feetR.pivot);
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