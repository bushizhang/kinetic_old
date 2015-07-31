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
var scene, camera, renderer, controls, light;
var torso, pelvis, thigh, leg;

function init() {
  // scene + camera
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 15;

  controls = new THREE.OrbitControls(camera);
  controls.target = new THREE.Vector3(0, 1, 0);
  controls.update();

  // renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setClearColor(0xFFFFFF);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  initLights();
  initShapes();
};

function render() {
  requestAnimationFrame(render);
  renderer.render(scene, camera);
};

// TODO: configurable
function initLights() {
  light = new THREE.DirectionalLight(0xffffff, 1/2);
  light.position.set(20, 10, 20);
  scene.add(light);

  light = new THREE.DirectionalLight(0xffffff, 1/2);
  light.position.set(-20, 10, 20);
  scene.add(light);
};

function initShapes() {
  // head: cube
  // torso: 2 trapezoids prisms
  initTorso();

  // pelvis: rectangular prism
  initPelvis();

  // 2 arms: truncated square pyramid - truncated square pyramid - rectangular prism
  // 2 legs: truncated square pyramid - truncated square pyramid - rectangular prism
  initThigh();
  initLeg();
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
  // var material = new THREE.MeshNormalMaterial();
  var material = new THREE.MeshPhongMaterial( { color: 0x00b2fc, specular: 0x00ffff, shininess: 20 } );

  torso = new THREE.Mesh(geometry, material);
  torso.position.x -= 1;

  scene.add(torso);
};

function initPelvis() {
  var p1 = new THREE.Vector2(-0.5, 0);
  var p2 = new THREE.Vector2(1.5, 0);
  var p3 = new THREE.Vector2(1.5, 1);
  var p4 = new THREE.Vector2(-0.5, 1);
  var height = 1;

  var geometry = new PrismGeometry([p1, p2, p3, p4], height);
  var material = new THREE.MeshPhongMaterial( { color: 0x00b2fc, specular: 0x00ffff, shininess: 20 } );
  // var material = new THREE.MeshNormalMaterial();
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
  var material = new THREE.MeshPhongMaterial( { color: 0x00b2fc, specular: 0x00ffff, shininess: 20 } );
  // var material = new THREE.MeshNormalMaterial();
  thigh = new THREE.Mesh(geometry, material);
  thigh.position.x += 0.25;
  thigh.position.y -= 1.5;
  thigh.position.z += 1;
  thigh.rotation.y += Math.PI / 2;

  scene.add(thigh);
};

// Leg is 2 parts, the top + bototm
function initLeg() {
};

init();
render();

// function truncatedSquarePyramid() {
// };