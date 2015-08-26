var ObjectDetail = Backbone.View.extend({
  el: 'div#object-detail',
  bindings: {
    '#body-name': 'name',
    '#body-origin-x': {
      observe: 'origin',
      onGet: function(value) { return value.x },
      onSet: function(value) {
        console.log(parseFloat(value));
        this.model.get('origin').x = parseFloat(value);
        this.model.trigger('change:origin', this.model);
        return this.model.get('origin');
      }
    },
    '#body-origin-y': {
      observe: 'origin',
      onGet: function(value) { return value.y },
      onSet: function(value) {
        this.model.get('origin').y = parseFloat(value);
        this.model.trigger('change:origin', this.model);
        return this.model.get('origin');
      }
    },
    '#body-origin-z': {
      observe: 'origin',
      onGet: function(value) { return value.z },
      onSet: function(value) {
        this.model.get('origin').z = parseFloat(value);
        this.model.trigger('change:origin', this.model);
        return this.model.get('origin');
      }
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