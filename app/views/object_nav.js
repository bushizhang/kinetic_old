var ObjectNav = Backbone.View.extend({
  el: 'div#object-nav',
  bindings: {},
  events: {},
  initialize: function() {},
  render: function() {
    var template = new EJS({ url: 'templates/object_nav.ejs' }).render({});
    this.$el.html(template);
    return this;
  }
});
