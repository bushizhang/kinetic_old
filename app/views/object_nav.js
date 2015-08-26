var ObjectNav = Backbone.View.extend({
  el: 'div#object-nav',
  bindings: {},
  events: {
    'click #object-nav-create-object': 'createBody',
    'click #object-nav-objects li': 'viewBodyDetails'
  },
  initialize: function(options) {
    this.parentView = options.parentView;
    this.collection = options.collection || new Bodies();
  },
  render: function() {
    var template = new EJS({ url: 'templates/object_nav.ejs' }).render({ collection: this.collection });
    this.$el.html(template);
    return this;
  },
  createBody: function() {
    var defaults = { name: 'BODY_' + this.collection.length, origin: new THREE.Vector3() };
    body = new Body(defaults);

    // re-render to draw
    this.collection.add(body);
    this.render();
  },
  viewBodyDetails: function(event) {
    var currentModel = this.collection.get({ cid: $(event.currentTarget)[0].dataset.objectid });
    if (this.objectDetailView) {
      this.removeChildView();
      var current = $('#object-nav-objects li.active')[0];
      $('#object-nav-objects li').removeClass('active');

      // clicked on a new li
      if (current !== $(event.currentTarget)[0]) {
        $(event.currentTarget).addClass('active');

        // re-render
        this.objectDetailView = new ObjectDetail({ model: currentModel , parentView: this });
        this.objectDetailView.render();
      }
    } else {
      $(event.currentTarget).addClass('active');
      this.objectDetailView = new ObjectDetail({ model: currentModel , parentView: this });
      this.objectDetailView.render();
    };
  },
  removeChildView: function() {
    if (!this.objectDetailView) return;

    // TODO: use a new div to append with so this isnt needed
    this.objectDetailView.remove();
    this.objectDetailView = null;
    $('#secondary-nav').append('<div id="object-detail"></div>');
  }
});
