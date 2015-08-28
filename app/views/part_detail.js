var PartDetail = Backbone.View.extend({
  el: 'div#part-detail',
  bindings: {
    '#part-name': 'name',

    // Can be updated directly without model event as it directly binds to the pivot mesh rotation
    '#part-rotation-x': {
      observe: 'rotation',
      onGet: function(value) { return 5 * Math.round(value.x * (36 / Math.PI)) },
      onSet: function(value) {
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
      onGet: function(value) { return value.width },
      onSet: function(value) {
        this.model.get('size').width = parseFloat(value);
        this.model.trigger('change:size', this.model);
        return this.model.get('size');
      }
    },
    '#part-height': {
      observe: 'size',
      onGet: function(value) { return value.height },
      onSet: function(value) {
        this.model.get('size').height = parseFloat(value);
        this.model.trigger('change:size', this.model);
        return this.model.get('size');
      }
    },
    '#part-depth': {
      observe: 'size',
      onGet: function(value) { return value.depth },
      onSet: function(value) {
        this.model.get('size').depth = parseFloat(value);
        this.model.trigger('change:size', this.model);
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