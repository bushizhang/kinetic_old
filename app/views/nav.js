var Nav = Backbone.View.extend({
  el: 'div#main-nav',
  bindings: {},
  events: {
    'click #object-details': 'toggleObjectNav'
  },
  initialize: function() {},
  render: function() {
    var template = new EJS({ url: 'templates/nav.ejs' }).render({});
    this.$el.html(template);
    return this;
  },
  toggleObjectNav: function(event) {
    $(event.currentTarget).toggleClass('active');

    if (this.objectNavView) {
      // TODO: use a new div to append with so this isnt needed
      // to prevent memory leaks, remove the view then reappend the parent container
      this.objectNavView.remove();
      this.objectNavView = null;
      $('#secondary-nav').append('<div id="object-nav"></div>')
    } else {
      this.objectNavView = new ObjectNav({ collection: bodies });
      this.objectNavView.render();
    }
  }
});
