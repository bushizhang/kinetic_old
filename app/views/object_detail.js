var ObjectDetail = Backbone.View.extend({
  el: 'div#object-detail',
  bindings: {
    '#body-name': 'name',
    '#body-origin-x': {
      observe: 'origin',
      onGet: function(value) { return value.x },
      onSet: function(value) { this.model.get('origin').x = parseInt(value); return this.model.get('origin'); }
    },
    '#body-origin-y': {
      observe: 'origin',
      onGet: function(value) { return value.y },
      onSet: function(value) { this.model.get('origin').y = parseInt(value); return this.model.get('origin'); }
    },
    '#body-origin-z': {
      observe: 'origin',
      onGet: function(value) { return value.z },
      onSet: function(value) { this.model.get('origin').z = parseInt(value); return this.model.get('origin'); }
    }
  },
  events: {},
  initialize: function(options) {
    this.model = options.model;
  },
  render: function() {
    var template = new EJS({ url: 'templates/object_detail.ejs' }).render({ model: this.model });
    this.$el.html(template);
    this.stickit();
    return this;
  }
});