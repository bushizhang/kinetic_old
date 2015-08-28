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
  events: {
    'click #menu-body-parts li': 'viewPartDetails'
  },
  initialize: function(options) {
    this.model = options.model;
    this.collection = this.model.bodyParts;
  },
  render: function() {
    var template = new EJS({ url: 'templates/object_detail.ejs' }).render({ model: this.model, collection: this.collection });
    this.$el.html(template);
    this.stickit();
    return this;
  },
  viewPartDetails: function(event) {
    var currentModel = this.collection.get({ cid: $(event.currentTarget)[0].dataset.objectid });

    if (this.partDetailView) {
      this.removeChildView();
      var current = $('#menu-body-parts li.active')[0];
      $('#menu-body-parts li').removeClass('active');

      // clicked on a new li
      if (current !== $(event.currentTarget)[0]) {
        $(event.currentTarget).addClass('active');

        // re-render
        this.partDetailView = new PartDetail({ model: currentModel, parentView: this });
        this.partDetailView.render();
      }
    } else {
      $(event.currentTarget).addClass('active');
      this.partDetailView = new PartDetail({ model: currentModel, parentView: this });
      this.partDetailView.render();
    };

  },
  removeChildView: function() {
    if (!this.partDetailView) return;

    this.partDetailView.remove();
    this.partDetailView = null;
    $('#ternary-nav').append('<div id="part-detail"></div>');
  }
});