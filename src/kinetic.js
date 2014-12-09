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
var scene, camera, randerer, light;
var torso;

function init() {
  // scene + camera
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  // lights
  scene.add(new THREE.AmbientLight(0x404040));
  light = new THREE.DirectionalLight(0xffffff);
  light.position.set(0, 1, 0);
  scene.add(light);

  // renderer
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  initShapes();
};

function render() {
  requestAnimationFrame(render);
  renderer.render(scene, camera);
};

function initShapes() {
  // head: cube
  // torso: 2 trapezoids prisms
  initTorso();

  // pelvis: rectangular prism
  // 2 arms: truncated square pyramid - truncated square pyramid - rectangular prism
  // 2 legs: truncated square pyramid - truncated square pyramid - rectangular prism
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
  // var material = new THREE.MeshLambertMaterial({ color: 0xffffff });
  // var material = new THREE.MeshBasicMaterial({ color: 0xffffff });
  var material = new THREE.MeshNormalMaterial();
  torso = new THREE.Mesh(geometry, material);

  scene.add(torso);
};

init();
render();

// function rectangularPrism() {

// };

// function truncatedSquarePyramid() {

// };