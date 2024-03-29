var Nav = Backbone.View.extend({
  el: 'div#main-nav',
  bindings: {},
  events: {
    'click #object-details': 'toggleObjectNav'
  },
  initialize: function(options) {
    this.parentView = options.parentView;
  },
  render: function() {
    var template = new EJS({ url: 'templates/nav.ejs' }).render({});
    this.$el.html(template);
    return this;
  },
  toggleObjectNav: function(event) {
    if (this.objectNavView) {
      $('li.main-nav-button').removeClass('active');
      this.removeChildView();
    } else {
      $(event.currentTarget).toggleClass('active');
      this.objectNavView = new ObjectNav({ collection: this.parentView.bodies, parentView: this });
      this.objectNavView.render();
    };
  },
  removeChildView: function() {
    if (!this.objectNavView) return;

    // TODO: use a new div to append with so this isnt needed
    // to prevent memory leaks, remove the view then reappend the parent container
    this.objectNavView.removeChildView();
    this.objectNavView.remove();
    this.objectNavView = null;
    $('#secondary-nav').prepend('<div id="object-nav"></div>');
  },
  addBody: function(body) {
    // THREEJS related
    this.parentView.addToScene(body);
    this.parentView.updateSceneIntersects(body);
    this.parentView.initMeshLookup(body);
  }
});
