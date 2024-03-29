// a top level (for now) object which contains threejs objects

// We can divide the body into 2 main components:
// Upper Torso: including the head, chest, upper arm, lower arm, hands
// Bottom Torso: including the pelvis, thighs, legs, feet
var Body = Backbone.Model.extend({
  initialize: function(options) {
    this.name  = options.name || {};

    // TODO: figure out if configs contain sex or vice-versa
    this.sex    = options.sex || {};
    this.config = options.config || {};
    this.origin = options.origin || new THREE.Vector3();

    // TODO: is a ThreeBody object necessary?
    // this.threeObj = new ThreeBody();

    // references to the other bodyparts
    // consider adding direct references between threeBodyParts?
    this.bodyParts = new BodyParts();

    this.buildBodyParts();
    this.initThreeBindings();
  },
  buildBodyParts: function() {
    // TODO: clean up the build logic with dynamic functions perhaps
    var builds = [
      { name: 'torso', builder: Torso },
      { name: 'head', builder: Head, parent: 'torso' },
      { name: 'upperArmL', builder: UpperArm, parent: 'torso', builderParams: { orientation: 'L' } },
      { name: 'upperArmR', builder: UpperArm, parent: 'torso', builderParams: { orientation: 'R' } },
      { name: 'armL', builder: Arm, parent: 'upperArmL' },
      { name: 'armR', builder: Arm, parent: 'upperArmR' },
      { name: 'handL', builder: Hand, parent: 'armL' },
      { name: 'handR', builder: Hand, parent: 'armR' },
      { name: 'pelvis', builder: Pelvis },
      { name: 'thighL', builder: Thigh, parent: 'pelvis', builderParams: { orientation: 'L' } },
      { name: 'thighR', builder: Thigh, parent: 'pelvis', builderParams: { orientation: 'R' } },
      { name: 'legL', builder: Leg, parent: 'thighL' },
      { name: 'legR', builder: Leg, parent: 'thighR' },
      { name: 'feetL', builder: Feet, parent: 'legL' },
      { name: 'feetR', builder: Feet, parent: 'legR' }
    ];

    _(builds).each(function(build){
      var bodyPart = new BodyPart(_.extend(build, { body: this }));
      this.bodyParts.add(bodyPart);
    }.bind(this));
  },
  part: function(name) {
    return this.bodyParts.findWhere({ name: name });
  },
  getPartsMesh: function() {
    return _(this.bodyParts.models).map(function(part) {
      return part.threeObj.mesh
    });
  },
  // TODO: consider refactoring torso and pelvis into one body object so we don't need to trigger any events
  initThreeBindings: function() {
    this.on('change:origin', function(model) {
      // NOTE: a body's origin is really just the pelvis origin + the torso origin, the rest is relative
      this.part('torso').threeObj.moveOriginTo(model.get('origin'));
      this.part('pelvis').threeObj.moveOriginTo(model.get('origin'));
    });
  }
});
var Bodies = Backbone.Collection.extend({ model: Body });

var BodyPart = Backbone.Model.extend({
  initialize: function(options) {
    this.body = options.body;
    this.name = options.name;
    this.builder = options.builder;
    this.builderParams = options.builderParams || {};

    // pelvis + torso has no parent
    if (options.parent) {
      this.parent = this.body.part(options.parent).threeObj;
      _.extend(this.builderParams, { parent: this.parent });
    }

    this.threeObj = new this.builder(this.builderParams);

    // TODO: this should be populated from the options, instead of it living inside three_body.js
    this.set('rotation', this.threeObj.pivot.mesh.rotation);
    this.set('size', new THREE.Vector3(1, 1, 1));

    this.initThreeBindings();
  },
  initThreeBindings: function() {
    this.on('change:size', function(model) {
      this.threeObj.setNewScale(model.get('size').clone());
    });
  }
});
var BodyParts = Backbone.Collection.extend({});