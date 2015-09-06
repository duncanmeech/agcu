var ATGC = ATGC || {};

/**
 * basic app class, resets itself everytime a new sequence is requested.
 * @constructor
 */
ATGC.App = function() {

  // grab DOM UI elements
  this.UISetup();

};

/**
 * grab UI elements we need
 */
ATGC.App.prototype.UISetup = function() {

  // extend this object with data-element tagged DOM elements
  D.importElements(document.body, this);

  // sink events on UI
  this.sequenceForm.addEventListener('submit', this.submitSequence.bind(this));

  // sink events on the global bus
  Events.I().subscribe(Events.VERTEX_PICKED, this.vertexPicked.bind(this));

  // mouse events, only handled within the context of a vertex drag
  Events.I().subscribe(Events.MOUSE_MOVE, this.mouseMove.bind(this));
  Events.I().subscribe(Events.MOUSE_UP, this.mouseUp.bind(this));

  // initialize graph display surface
  this.graph = new ATGC.Display(this.displaySurface);

  // set initial UI state
  this.enterState(ATGC.App.UI_FSM.NewSequence);
};

/**
 * when the user starts a drag on a vertex
 * @return {[type]} [description]
 */
ATGC.App.prototype.vertexPicked = function (event, vertex) {

  // if we are evolving the graph, then exit that state and switch to
  // user input mode
  if (this.state === ATGC.App.UI_FSM.DisplaySequence) {
    this.enterState(ATGC.App.UI_FSM.EditGraph);
  }

  // if we are in edit mode then start a drag
  if (this.state === ATGC.App.UI_FSM.EditGraph) {
    this.dragVertex = vertex;
    this.enterState(ATGC.App.UI_FSM.DragVertex);
  }
};

/**
 * mouse move handler
 * @param  {[type]} event [description]
 * @param  {[type]} p     [description]
 * @return {[type]}       [description]
 */
ATGC.App.prototype.mouseMove = function(event, p) {

  // ignore unless we are dragging a vertex
  if (this.state === ATGC.App.UI_FSM.DragVertex) {
    // move the vertex element to given position
    this.dragVertex.element.updatePosition(p);
  }
};

/**
 * mouse move handler
 * @param  {[type]} event [description]
 * @param  {[type]} p     [description]
 * @return {[type]}       [description]
 */
ATGC.App.prototype.mouseUp = function(event, p) {

  // ignore unless we are dragging a vertex
  if (this.state === ATGC.App.UI_FSM.DragVertex) {
    console.log('end drag vertex');
    // back to edit mode
    this.enterState(ATGC.App.UI_FSM.EditGraph);
  }
};



/**
 * enter a new UI state
 * @param  {[type]} state [description]
 * @return {[type]}       [description]
 */
ATGC.App.prototype.enterState = function(state) {

  // exit the old state
  this.exitState(this.state);

  // start the new state
  this.state = state;

  switch (this.state) {

    // validate and display new sequence
    case ATGC.App.UI_FSM.NewSequence:

      var dbn = new ATGC.DBN(this.sequenceInput.value, this.dbnInput.value);
      var error = dbn.validate();
      this.enterState(error ? ATGC.App.UI_FSM.SequenceError : ATGC.App.UI_FSM.DisplaySequence);

      break;

      // current sequence has an error, display it
    case ATGC.App.UI_FSM.SequenceError:

      var dbn = new ATGC.DBN(this.sequenceInput.value, this.dbnInput.value);
      alert(dbn.validate());

      break;

      // display a valid sequence
    case ATGC.App.UI_FSM.DisplaySequence:

      // sequence appears valid, display it
      var dbn = new ATGC.DBN(this.sequenceInput.value, this.dbnInput.value);
      this.graph.showSequence(dbn);

      // start a timer to improve the layout until we exit this state
      this.displayTimer = setInterval(this.evolveGraph.bind(this), ATGC.Display.kGRAPH_UPDATE_TIME * 2);

      break;

      // user is manipulating the graph
    case ATGC.App.UI_FSM.EditGraph:

      break;

      // user is dragging a vertex
    case ATGC.App.UI_FSM.DragVertex:

      U.ASSERT(this.dragVertex, 'Expecting a vertex to be assigned to this.vertex');

      break;
  }
};

/**
 * exit the current UI state
 * @return {[type]} [description]
 */
ATGC.App.prototype.exitState = function() {

  switch (this.state) {

    // cancel the update timer
    case ATGC.App.UI_FSM.DisplaySequence:

      U.ASSERT(this.displayTimer, 'Expected a timer to be running');
      clearInterval(this.displayTimer);
      this.displayTimer = null;

    break;
  }

  this.state = ATGC.App.UI_FSM.None;
};

/**
 * update the graph display
 * @return {[type]} [description]
 */
ATGC.App.prototype.evolveGraph = function () {

  U.ASSERT(this.graph, 'Expected a graph');
  this.graph.continueLayout();
};


/**
 * user submitted a new sequence via the input form
 * @param  {Event} e
 * @return {Boolean}
 */
ATGC.App.prototype.submitSequence = function(e) {

  // start new sequence and prevent form submission

  this.enterState(ATGC.App.UI_FSM.NewSequence);
  e.preventDefault();
  return true;
};



/**
 * states for user interface finite state machine
 */
ATGC.App.UI_FSM = {

  // no state
  None: 'None',

  // validate and display a new sequence
  NewSequence: 'NewSequence',

  // sequence has an error, display it
  SequenceError: 'SequenceError',

  // display a valid sequence
  DisplaySequence: 'DisplaySequence',

  // user is editing the graph, but not actually doing anything at this time
  EditGraph: 'EditGraph',

  // user is dragging a vertex, this.dragVertex is the vertex
  DragVertex: 'DragVertex'

};
