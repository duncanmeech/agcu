var ATGC = ATGC || {};

/**
 * basic app class, resets itself everytime a new sequence is requested.
 * @constructor
 */
ATGC.App = function() {

  // grab DOM UI elements
  this.UISetup();

  // reset to the current sequence
  this.reset();

};

/**
 * grab UI elements we need
 */
ATGC.App.prototype.UISetup = function() {

  // extend this object with data-element tagged DOM elements
  D.importElements(document.body, this);

  // sink events on UI
  this.sequenceForm.addEventListener('submit', this.submitSequence.bind(this));

  // initialize graph display surface
  this.graph = new ATGC.Display(this.displaySurface);
};


/**
 * user submitted a new sequence
 * @param  {Event} e
 * @return {Boolean}
 */
ATGC.App.prototype.submitSequence = function(e) {

  // start new sequence and prevent form submission
  e.preventDefault();
  this.reset();
  return true;
};

/**
 * start displaying a new sequence
 */
ATGC.App.prototype.reset = function() {

  // get the sequence and associated DBN
  var s = _.trim(this.sequenceInput.value);
  var d = _.trim(this.dbnInput.value);

  if (s || d) {
    var dbn = new ATGC.DBN(s, d);
    var error = dbn.validate();
    if (error) {
      alert("Sequence error:" + error);
    } else {
      // sequence appears, display it
      this.graph.showSequence(dbn);
    }
  }
};
