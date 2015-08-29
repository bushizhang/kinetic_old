var PartDetail = Backbone.View.extend({
  el: 'div#part-detail',
  bindings: {
    '#part-name': 'name',

    // Can be updated directly without model event as it directly binds to the pivot mesh rotation
    '#part-rotation-x': {
      observe: 'rotation',
      onGet: function(value) { return 5 * Math.round(value.x * (36 / Math.PI)) },
      onSet: function(value, event) {
        this.model.get('rotation').x = parseFloat(value / 5) * Math.PI / 36;
        return this.model.get('rotation');
      }
    },
    '#part-rotation-y': {
      observe: 'rotation',
      onGet: function(value) { return 5 * Math.round(value.y  * (36 / Math.PI)) },
      onSet: function(value) {
        this.model.get('rotation').y = parseFloat(value / 5) * Math.PI / 36;
        return this.model.get('rotation');
      }
    },
    '#part-rotation-z': {
      observe: 'rotation',
      onGet: function(value) { return 5 * Math.round(value.z * (36 / Math.PI)) },
      onSet: function(value) {
        this.model.get('rotation').z = parseFloat(value / 5) * Math.PI / 36;
        return this.model.get('rotation');
      }
    },
    '#part-width': {
      observe: 'size',
      onGet: function(value) { return value.x },
      onSet: function(value) {
        var original = this.model.get('size');
        this.model.set('size', new THREE.Vector3(parseFloat(value), original.y, original.z));
        return this.model.get('size');
      }
    },
    '#part-height': {
      observe: 'size',
      onGet: function(value) { return value.y },
      onSet: function(value) {
        var original = this.model.get('size');
        this.model.set('size', new THREE.Vector3(original.x, parseFloat(value), original.z));
        return this.model.get('size');
      }
    },
    '#part-depth': {
      observe: 'size',
      onGet: function(value) { return value.z },
      onSet: function(value) {
        var original = this.model.get('size');
        this.model.set('size', new THREE.Vector3(original.x, original.y, parseFloat(value)));
        return this.model.get('size');
      }
    }
  },
  events: {},
  initialize: function(options) {
    this.model = options.model;
  },
  render: function() {
    var template = new EJS({ url: 'templates/part_detail.ejs' }).render({ model: this.model });
    this.$el.html(template);
    this.stickit();
    return this;
  }
});