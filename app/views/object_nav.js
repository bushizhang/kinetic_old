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
  createBody: function() {},
  viewBodyDetails: function(event) {
    $(event.currentTarget).toggleClass('active');
    if (this.objectDetailView) {
      this.removeChildView();
    } else {
      var currentModel = this.collection.get({ cid: $(event.currentTarget)[0].dataset.objectid });
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
