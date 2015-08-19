var selectedObject = {};

// Basic logic (backbone/stickit)
View = function(options) {
  this.model = options.model || {};
  this.events = options.events || {};
  this.bindings = options.bindings || {};
  this.element = options.element || {};

  this.setupBindings();
  this.setupEvents();
};
View.prototype = {
  setupBindings: function() {
    // loop through bindings
    // check object property,
    // check jquery selector,
    // set initial value,
    // observe object property
  },
  setupEvents: function() {
    // loop through events,
    // setup callbacks
  }
};

var contextView = new View({
  model: selectedObject,
  element: '#context-view',
  bindings: {},
  events: {}
});