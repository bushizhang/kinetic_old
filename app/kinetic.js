var MODEL_COLOR = 0x888888;
var MODEL_SELECTED = 0xFFFFFF // 0xFEC24A;

function initUI() {
  var threeIndex = new ThreeIndex();
  threeIndex.render();

  var mainNav = new Nav({ parentView: threeIndex });
  mainNav.render();
};

initUI();
