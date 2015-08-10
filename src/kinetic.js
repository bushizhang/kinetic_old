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

var scene, camera, renderer, controls, light, lights;
var raycaster, intersected, selected, mouse;
var geometry, geometries;
var objects;

var body;

function init() {
  // scene + camera
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 20;

  // controls
  controls = new THREE.OrbitControls(camera);
  controls.target = new THREE.Vector3(0, 1, 0);
  controls.update();

  // renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setClearColor(0xeeeeee);
  renderer.setSize(window.innerWidth, window.innerHeight);

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2(-10, -10); // move it away from the initial object so there is no highlighting

  initListeners();
  initHelpers();
  initLights();

  initBody();

  document.body.appendChild(renderer.domElement);
};

function initListeners() {
  document.addEventListener('mousemove', function(event) {
    event.preventDefault();

    mouse.x =   (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
  }, false);

  document.addEventListener('keyup', function(event) {
    if (!intersected) return;
    var intersectedPivot = body.objectFromMeshId[intersected.object.id].pivot;
    var rotationAngle = Math.PI / 36;

    switch (event.keyCode) {
      case 87: intersectedPivot.mesh.rotateY(rotationAngle) ; break;
      case 83: intersectedPivot.mesh.rotateY(-rotationAngle) ; break;
      case 68: intersectedPivot.mesh.rotateX(rotationAngle) ; break;
      case 65: intersectedPivot.mesh.rotateX(-rotationAngle) ; break;
      case 69: intersectedPivot.mesh.rotateZ(rotationAngle) ; break;
      case 81: intersectedPivot.mesh.rotateZ(-rotationAngle) ; break;
    }
  });
};

function initHelpers() {
  var axisHelper = new THREE.AxisHelper(100);
  // scene.add(axisHelper);

  var gridHelper = new THREE.GridHelper(100, 1);
  // scene.add(gridHelper);
  gridHelper.setColors(0xcccccc, 0xcccccc)
};

// TODO: configurable
function initLights() {
  light = new THREE.DirectionalLight(0xffffff, 1/2);
  light.position.set(20, 10, 20);
  scene.add(light);

  light = new THREE.DirectionalLight(0xffffff, 1/2);
  light.position.set(-20, 10, 20);
  scene.add(light);

  var ambientLight = new THREE.AmbientLight(0x000000);
  scene.add(ambientLight);

  // lights = [];
  // lights[0] = new THREE.PointLight(0xffffff, 1, 0);
  // lights[1] = new THREE.PointLight(0xffffff, 1, 0);
  // lights[2] = new THREE.PointLight(0xffffff, 1, 0);

  // scene.add(lights[0]);
  // scene.add(lights[1]);
  // scene.add(lights[2]);

  // lights[0].position.set(0, 200, 0);
  // lights[1].position.set(100, 200, 100);
  // lights[2].position.set(-100, -200, -100);
};

// We can divide the body into 2 main components:
// Upper Torso: including the head, chest, upper arm, lower arm, hands
// Bottom Torso: including the pelvis, thighs, legs, feet
function initBody() {
  body = new Body();

  scene.add(body.pelvis.pivot.mesh);
  scene.add(body.torso.pivot.mesh);

  objects = [
    body.torso.mesh,
    body.head.mesh,
    body.upperArmL.mesh, body.upperArmR.mesh,
    body.armL.mesh, body.armR.mesh,
    body.handL.mesh, body.handR.mesh,
    body.pelvis.mesh,
    body.thighL.mesh, body.thighR.mesh,
    body.legL.mesh, body.legR.mesh,
    body.feetL.mesh, body.feetR.mesh
  ];
};

function render() {
  // body.pelvis.pivot.mesh.rotation.y += 0.01;
  // body.thighL.pivot.mesh.rotation.y += 0.02;
  // feetPivotL.rotation.x += 0.01;
  // kneePivotL.rotation.y -= 0.01;
  // thighPivotL.rotation.y += 0.01;
  // pelvisPivot.rotation.y -= 0.01;
  calculateIntersection();

  requestAnimationFrame(render);
  renderer.render(scene, camera);
};

function calculateIntersection() {
  raycaster.setFromCamera(mouse, camera);
  var intersects = raycaster.intersectObjects(objects);
  if (intersects.length > 0) {
    if (intersects[0] !== intersected) {
      if (intersected) intersected.object.material.color.set(0x474747);
      intersected = intersects[0];
      intersected.object.material.color.set(0x111111);
    } else {
      if (intersected) intersected.object.material.color.set(0x474747);
      intersected = null;
    };
  } else {
    if (intersected) {
      intersected.object.material.color.set(0x474747);
      intersected = null;
    }
  };
};

init();
render();
