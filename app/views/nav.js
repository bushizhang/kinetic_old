var Nav = Backbone.View.extend({
  el: 'div#main-nav',
  bindings: {},
  events: {},
  initialize: function() {},
  render: function() {
    var template = new EJS({ url: 'templates/nav.ejs' }).render({});
    this.$el.html(template);
    return this;
  }
});
