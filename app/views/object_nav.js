var ObjectNav = Backbone.View.extend({
  el: 'div#object-nav',
  bindings: {},
  events: {},
  initialize: function(options) {
    this.collection = options.collection || new Bodies();
  },
  render: function() {
    var template = new EJS({ url: 'templates/object_nav.ejs' }).render({ collection: this.collection });
    this.$el.html(template);
    return this;
  }
});
