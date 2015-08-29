// This view handles all threejs references/logic
// It does not have a template
var ThreeIndex = Backbone.View.extend({
  el: $('#main-canvas')[0],
  events: {
    'mousemove': 'updateMouse',
    'mouseup':   'updateSelected'
  },
  initialize: function(options) {
    this.width  = window.innerWidth || options.width || 1200;
    this.height = window.innerHeight || options.height || 800;
    this.aspectRatio = this.width / this.height;

    this.scene   = new THREE.Scene();
    this.uiScene = new THREE.Scene(); // this scene is for drawing ui helpers on top of the canvas
    // this.scene.fog = new THREE.Fog(MODEL_COLOR, 0, 40);

    this.camera = new THREE.PerspectiveCamera(75, this.aspectRatio, 0.1, 1000);
    this.camera.position.z = 10;

    this.raycaster = new THREE.Raycaster();
    this.mouse     = new THREE.Vector2();
    this.intersected;
    this.selected;

    this.initRenderer();
    this.initControls();
    this.initLights();
    // this.initHelpers();

    this.initBodies();

    // Since backbone don't like keypress events... we bind manually
    $(document).on('keyup', this.rotateSelected.bind(this));
  },
  initRenderer: function() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: this.el });
    this.renderer.autoClear = false;
    this.renderer.setClearColor(0x222222);
    this.renderer.setSize(this.width, this.height);
  },
  initControls: function() {
    this.controls = new THREE.OrbitControls(this.camera, this.el);
    this.controls.noKeys = true;
    this.controls.target = new THREE.Vector3(0, 1, 0);
    this.controls.rotateUp(35 * Math.PI / 180);
    this.controls.rotateLeft(-35 * Math.PI / 180);
    this.controls.update();
  },
  initLights: function() {
  // TODO: configurable
    var light = new THREE.DirectionalLight(0xffffff, 1/2);
    light.position.set(20, 10, 20);
    this.scene.add(light);

    light = new THREE.DirectionalLight(0xffffff, 1/2);
    light.position.set(-20, 10, 20);
    this.scene.add(light);

    var ambientLight = new THREE.AmbientLight(0x333333);
    this.scene.add(ambientLight);

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
  },
  initHelpers: function() {
    var axisHelper = new THREE.AxisHelper(100);
    // this.scene.add(axisHelper);

    var gridHelper = new THREE.GridHelper(100, 1);
    gridHelper.setColors(0xcccccc, 0xcccccc)
    // this.scene.add(gridHelper);
  },
  initBodies: function() {
    this.bodies = new Bodies();
    this.objects = [];
    this.objectsFromMeshId = {};
  },
  render: function() {
    this.threeRender();

    return this;
  },
  threeRender: function() {
    this.controls.update();
    this.calculateIntersection();

    requestAnimationFrame(this.threeRender.bind(this));

    this.renderer.clear();
    this.renderer.render(this.scene, this.camera);
    this.renderer.clearDepth();
    this.renderer.render(this.uiScene, this.camera);
  },
  updateMouse: function(event) {
    event.preventDefault();

    // This is if we want an offset to the canvas
    // mouse.x =   ((event.clientX - menuOffset) / (window.innerWidth - menuOffset)) * 2 - 1;
    this.mouse.x =   (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
  },
  updateSelected: function(event) {
    if (!this.intersected) {
      this.unselectObject();
      return;
    }

    this.selectObject();
  },
  rotateSelected: function(event) {
    if (!this.selected) return;

    // Instead of updating the pivot directly, update the backbone model's rotation
    // var intersectedPivot = objectsFromMeshId[selected.object.id].pivot;
    var intersectedPart = this.objectsFromMeshId[this.selected.object.id];
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
  },
  selectObject: function() {
    this.unselectObject();

    this.selected = this.intersected;
    this.selected.object.material.color.set(MODEL_SELECTED);

    // draw orbits
    // var selectedPivot = this.objectsFromMeshId[this.selected.object.id].pivot;
    // pivotHelper = new PivotHelper(selectedPivot);
    // this.uiScene.add(this.pivotHelper.mesh);
  },
  unselectObject: function() {
    if (!this.selected) return;

    this.selected.object.material.color.set(MODEL_COLOR);
    this.selected = null;

    // remove orbits
    // this.uiScene.remove(this.pivotHelper.mesh);
  },
  calculateIntersection: function() {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    var intersects = this.raycaster.intersectObjects(this.objects);
    if (intersects.length > 0) {
      if (intersects[0] !== this.intersected) {
        this.intersectObject(intersects[0]);
      } else {
        this.unintersectObject();
      };
    } else {
      this.unintersectObject();
    };
  },
  intersectObject: function(object) {
    this.unintersectObject();
    this.intersected = object;
  },
  unintersectObject: function() {
    if (!this.intersected) return;
    this.intersected = null;
  },
  addToScene: function(body) {
    this.scene.add(body.part('pelvis').threeObj.pivot.mesh);
    this.scene.add(body.part('torso').threeObj.pivot.mesh);
  },
  updateSceneIntersects: function(body) {
    this.objects = this.objects.concat(body.getPartsMesh());
  },
  // since intersection uses the object mesh, we need to keep a hash of the objects' mesh ids for easy lookup
  initMeshLookup: function(body) {
    _(body.bodyParts.models).each(function(part) {
      var meshId = part.threeObj.mesh.id;
      this.objectsFromMeshId[meshId] = part; //part;
    }.bind(this));
  }
});