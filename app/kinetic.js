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
var MODEL_COLOR = 0x888888;
var MODEL_SELECTED = 0xFFFFFF // 0xFEC24A;

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

// TODO: clean up globals with top level view
var scene, scene2, camera, renderer, controls, light, lights, fog;
var raycaster, intersected, selected, pivotHelper, mouse;
var geometry, geometries;
var objects = [];
var objectFromMeshId = {};
var body, bodies;

function init() {
  // scenes + camera
  scene = new THREE.Scene();
  scene2 = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 10;
  // controls
  controls = new THREE.OrbitControls(camera, $('#main-canvas')[0]);
  controls.noKeys = true;
  controls.target = new THREE.Vector3(0, 1, 0);
  controls.rotateUp(35 * Math.PI / 180);
  controls.rotateLeft(-35 * Math.PI / 180);
  controls.update();

  // scene.fog = new THREE.Fog(MODEL_COLOR, 0, 40);

  // renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, canvas: $('#main-canvas')[0] });
  renderer.autoClear = false;
  renderer.setClearColor(0x222222);
  renderer.setSize(window.innerWidth, window.innerHeight);

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2(); // move it away from the initial object so there is no highlighting

  initListeners();
  initHelpers();
  initLights();

  initBody();
};

function initUI() {
  var mainNav = new Nav();
  mainNav.render();
};

function initListeners() {
  document.addEventListener('mousemove', function(event) {
    event.preventDefault();

    // This is if we want an offset to the canvas
    // mouse.x =   ((event.clientX - menuOffset) / (window.innerWidth - menuOffset)) * 2 - 1;
    mouse.x =   (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
  }, false);

  document.addEventListener('keyup', function(event) {
    if (!selected) return;

    // Instead of updating the pivot directly, update the backbone model's rotation
    // var intersectedPivot = objectFromMeshId[selected.object.id].pivot;
    var intersectedPart = objectFromMeshId[selected.object.id];
    var rotationAngle = Math.PI / 36;

    // TODO: add back pivotHelper.mesh.rotateY(rotationAngle);
    var newRotation = intersectedPart.get('rotation');
    switch (event.keyCode) {
      case 87: newRotation.y += rotationAngle; break;
      case 83: newRotation.y -= rotationAngle; break;
      case 68: newRotation.x += rotationAngle; break;
      case 65: newRotation.x -= rotationAngle; break;
      case 69: newRotation.z += rotationAngle; break;
      case 81: newRotation.z -= rotationAngle; break;
    }

    intersectedPart.set('rotation', newRotation);
    intersectedPart.trigger('change:rotation', intersectedPart);
  });

  document.addEventListener('mouseup', function(event) {
    // if no intersect, unselect
    if (!intersected) {
      this.unselectObject();
      return;
    }

    // if intersect then reselect
    this.selectObject();
  }.bind(this));
};

function selectObject() {
  this.unselectObject();

  selected = intersected;
  selected.object.material.color.set(MODEL_SELECTED);

  // draw orbits
  // var selectedPivot = objectFromMeshId[selected.object.id].pivot;
  // pivotHelper = new PivotHelper(selectedPivot);
  // scene2.add(pivotHelper.mesh);
};

function unselectObject() {
  if (!selected) return;

  selected.object.material.color.set(MODEL_COLOR);
  selected = null;

  // remove orbits
  // scene2.remove(pivotHelper.mesh);
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

  var ambientLight = new THREE.AmbientLight(0x333333);
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

function initBody() {
  bodies = new Bodies();
};

function render() {
  controls.update();
  calculateIntersection();

  requestAnimationFrame(render);

  renderer.clear();
  renderer.render(scene, camera);
  renderer.clearDepth();
  renderer.render(scene2, camera);
};

function intersectObject(object) {
  this.unintersectObject();
  intersected = object;
};

function unintersectObject() {
  if (!intersected) return;
  intersected = null;
};

function calculateIntersection() {
  raycaster.setFromCamera(mouse, camera);
  var intersects = raycaster.intersectObjects(objects);
  if (intersects.length > 0) {
    if (intersects[0] !== intersected) {
      this.intersectObject(intersects[0]);
    } else {
      this.unintersectObject();
    };
  } else {
    this.unintersectObject();
  };
};

init();
initUI();
render();
