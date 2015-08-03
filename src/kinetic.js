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

// main logic
var material = new THREE.MeshLambertMaterial({
  shading: THREE.SmoothShading,
  color: 0x474747,
  emissive: 0x858585
});

var scene, camera, renderer, controls, light, lights;
var torso, pelvis, thigh, leg;
var thighPivot, legPivot;

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
  document.body.appendChild(renderer.domElement);

  // initHelpers();

  initLights();
  initShapes();
};

function initHelpers() {
  var axisHelper = new THREE.AxisHelper(100);
  scene.add(axisHelper);

  var gridHelper = new THREE.GridHelper(100, 1);
  scene.add(gridHelper);
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

function initShapes() {
  // head: cube
  // torso: 2 trapezoids prisms
  initTorso();

  // pelvis: rectangular prism
  initPelvis();

  // 2 arms: truncated square pyramid - truncated square pyramid - rectangular prism
  // 2 legs: truncated square pyramid - truncated square pyramid - rectangular prism
  initLeg();
  initThigh();
};

// TODO: scale
function initTorso() {
  // a default shape consists of [0,0], [1,1], [2,0], [2,2], [0,2]
  var p1 = new THREE.Vector2(0, 0);
  var p2 = new THREE.Vector2(1, 1);
  var p3 = new THREE.Vector2(2, 0);
  var p4 = new THREE.Vector2(2, 2);
  var p5 = new THREE.Vector2(0, 2);

  var height = 1;
  var geometry = new PrismGeometry([p1, p2, p3, p4, p5], height);

  torso = new THREE.Mesh(geometry, material);
  torso.position.x -= 1;
  scene.add(torso);
};

function initPelvis() {
  var p1 = new THREE.Vector2(-0.5, 0);
  var p2 = new THREE.Vector2(1.5, 0);
  var p3 = new THREE.Vector2(1.25, 1);
  var p4 = new THREE.Vector2(-0.25, 1);
  var height = 1;

  var geometry = new PrismGeometry([p1, p2, p3, p4], height);

  pelvis = new THREE.Mesh(geometry, material);
  pelvis.position.x -= 0.5;
  pelvis.position.y -= 1.5;

  scene.add(pelvis);
};

function initThigh() {
  var p1 = new THREE.Vector2(0, 0);
  var p2 = new THREE.Vector2(1, 0);
  var p3 = new THREE.Vector2(0.5, -2.5);
  var p4 = new THREE.Vector2(0, -2.5);
  var height = 0.85;

  var geometry = new PrismGeometry([p1, p2, p3, p4], height);
  thigh = new THREE.Mesh(geometry, material);
  thigh.position.x -= 0.4;
  thigh.position.y -= 0.4;
  thigh.position.z += 0.4;
  thigh.rotation.y += Math.PI / 2;

  var geometry = new THREE.SphereGeometry(0.5, 20, 20);
  thighPivot = new THREE.Mesh(geometry, material);
  thighPivot.position.x += 1;
  thighPivot.position.z += 0.5;
  thighPivot.position.y -= 1.5;

  thighPivot.add(thigh);
  thighPivot.add(legPivot);
  scene.add(thighPivot);
};

// Leg is 2 parts, the top + bototm
function initLeg() {
  // top
  var p1 = new THREE.Vector2(0, 0);
  var p2 = new THREE.Vector2(0.5, 0);
  var p3 = new THREE.Vector2(0.75, -1);
  var p4 = new THREE.Vector2(0.4, -3);
  var p5 = new THREE.Vector2(0, -3);
  var points = [p1, p2, p3, p4, p5]
  var height = 0.85;

  var geometry = new PrismGeometry(points, height);
  leg = new THREE.Mesh(geometry, material);
  leg.position.x -= 0.4;
  leg.position.z += 0.2;
  leg.rotation.y += Math.PI / 2;

  var geometry = new THREE.SphereGeometry(0.4, 20, 20);
  legPivot = new THREE.Mesh(geometry, material);
  legPivot.position.y -= 3;
  legPivot.position.z += 0.1;
  legPivot.add(leg);
  scene.add(legPivot);
  // bottom
};

function render() {
  // thighPivot.rotation.x += 0.01;
  // legPivot.rotation.x += 0.005;

  requestAnimationFrame(render);
  renderer.render(scene, camera);
};

init();
render();

// function truncatedSquarePyramid() {
// };