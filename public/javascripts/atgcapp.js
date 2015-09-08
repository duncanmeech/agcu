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
  Events.I().subscribe(Events.MOUSE_LEAVE, this.removeAsterisks.bind(this));

  // new sequence event
  Events.I().subscribe(Events.NEW_SEQUENCE, this.onNewSequence.bind(this));

  // user is creating a new edge
  Events.I().subscribe(Events.NEW_EDGE, this.onNewEdge.bind(this));

  // user completed construction of new edge
  Events.I().subscribe(Events.COMPLETE_EDGE, this.onCompleteEdge.bind(this));

  // new sequence can be triggered from the toolbar also
  this.displayButton.addEventListener('click', this.onDisplaySequence.bind(this));

  // share button handler
  this.shareButton.addEventListener('click', this.onSave.bind(this));

  // new button handler
  this.newButton.addEventListener('click', this.onNew.bind(this));

  // settings handler
  this.settingsButton.addEventListener('click', this.onSettings.bind(this));

  // track keyboard interactions with inputs
  this.sequenceInput.addEventListener('keyup', this.onInputKeyup.bind(this));
  this.dbnInput.addEventListener('keyup', this.onInputKeyup.bind(this));

  // track window resizing
  window.addEventListener('resize', this.onWindowResize.bind(this));

  // listen for change on select
  this.examplesSelect.addEventListener('change', this.onExample.bind(this));

  // initialize graph display surface
  this.graph = new ATGC.Display(this.displaySurface);

  // set initial UI state
  this.enterState(ATGC.App.UI_FSM.Initialize);
};

/**
 * select a canned example to display
 */
ATGC.App.prototype.onExample = function () {

  switch (this.examplesSelect.selectedIndex) {

    case 0:
    this.sequenceInput.value = 'ATGCATGCATGC';
    this.dbnInput.value = '((((....))))'
    break;

    case 1:
    this.sequenceInput.value = 'CAGCACGACACUAGCAGUCAGUGUCAGACUGCAIACAGCACGACACUAGCAGUCAGUGUCAGACUGCAIACAGCACGACACUAGCAGUCAGUGUCAGACUGCAIA';
    this.dbnInput.value = '..(((((...(((((...(((((...(((((.....)))))...))))).....(((((...(((((.....)))))...))))).....)))))...)))))..'
    break;

    case 2:
    this.sequenceInput.value = 'AAGAAGAGGTAGCGAGTGGACGTGACTGCTCTATCCCGGGCAAAAGGGATAGAACCAGAGGTGGGGAGTCTGGGCAGTCGGCGACCCGCGAAGACTTGAGGTGCCGCAGCGGCATCCGGAGTAGCGCCGGGCTCCCTCCGGGGTGCAGCCGCCGTCGGGGGAAGGGCGCCACAGGCCGGGAAGACCTCCTCCCTTTGTGTCCAGTAGTGGGGTCCACCGGAGGGCGGCCCGTGGGCCGGGCCTCACCGCGGCGCTCCGGGACTGTGGGGTCAGGCTGCGTTGGGTGGACGCCCACCTCGCCAACCTTCGGAGGTCCCTGGGGGTCTTCGTGCGCCCCGGGGCTGCAGAGATCCAGGGGAGGCGCCTGTGAGGCCCGGACCTGCCCCGGGGCGAAGGGTATGTGGCGAGACAGAGCCCTGCACCCCTAATTCCCGGTGGAAAACTCCTGTTGCCGTTTCCCTCCACCGGCCTGGAGTCTCCCAGTCTTGTCCCGGCAGTGCCGCCCTCCCCACTAAGACCTAGGCGCAAAGGCTTGGCTCATGGTTGACAGCTCAGAGAGAGAAAGATCTGAGGGAAGATG';
    this.dbnInput.value = '......((((..((...((.(((((((((((((((((........)))))))).(((((.........)))))))))))).)).))..))...))))........(((((....(((((.((.(((((....((((((.(.((((....)))).).))))))..))))).)).(((((.((((((((((((((...(((.((.((.(((((((((.((....)).((((....))))))))))))).)))))))...))))....(((((((((.((.((.((((((....)))))).)))).))).....)))))).)))))))))).)).)))))))))))))........((((((((.((((((...(((...((.(((((((...))..))))).)))))...)))).)))))...)))))..(((((..........((..(.(.(..((((.(((..(((((((...((.((...(((((((.....................)).)))))...)).))..))))).)).(((...........)))..))).)))))).).)))))))....'
    break;
  }

  this.vertices = null;
  this.enterState(ATGC.App.UI_FSM.NewSequence);
};

/**
 * layout when window resized unless the force directed layout is still happening
 * in which case the display is already responsive
 * @return {[type]} [description]
 */
ATGC.App.prototype.onWindowResize = function () {

  if (this.state !== ATGC.App.UI_FSM.DisplaySequence) {
    if (this.dbn && !this.dbn.validate()) {
      this.enterState(ATGC.App.UI_FSM.DisplaySequence);
    }
  }
};

/**
 * run the settings dialog
 * @return {[type]} [description]
 */
ATGC.App.prototype.onSettings = function() {
  // create dialog once only on demand

  if (!this.dialog) {

    // initialize but don't show

    this.dialog = $('[data-dialog=settings]').modal({
      show: false,
      keyboard: false,
      backdrop: 'static'
    });

    // sink events

    $('[data-element=cancel-button]', this.dialog).click($.proxy(function() {

      // user cancelled
      this.dialog.modal('hide');

    }, this));

    $('[data-element=confirm-button]', this.dialog).click($.proxy(function() {

      // close dialog
      this.dialog.modal('hide');

      // apply new settings
      S.I().apply({
        baseColor: document.getElementById('baseColor').value,
        baseSize: document.getElementById('baseSize').value,
        baseFont: document.getElementById('baseFont').value,
        lineWidth: document.getElementById('lineWidth').value,
      });

      // redisplay Graph
      this.vertices = null;
      this.enterState(ATGC.App.UI_FSM.NewSequence);

    }, this));

  }

  // run dialog
  this.dialog.modal('show');
};

/**
 * share the sequence if not already shared
 * @return {[type]} [description]
 */
ATGC.App.prototype.onSave = function() {
  this.enterState(ATGC.App.UI_FSM.ShareSave);
};

/**
 * share the sequence if not already shared
 * @return {[type]} [description]
 */
ATGC.App.prototype.onNew = function() {

  this.enterState(ATGC.App.UI_FSM.CreateNew);

};

/**
 * user is starting a new edge
 * @param  {[type]} event  [description]
 * @param  {[type]} vertex [description]
 * @return {[type]}        [description]
 */
ATGC.App.prototype.onNewEdge = function(event, vertex) {

  // start a new edge if it appears valid
  if (!this.hasNucleotideBond(vertex)) {
    this.sourceVertex = vertex;
    this.enterState(ATGC.App.UI_FSM.CreateEdge);
  }
};

/**
 * true if the vertex already has a nucleotide bond
 * @param  {[type]} vertex [description]
 * @return {[type]}        [description]
 */
ATGC.App.prototype.hasNucleotideBond = function(vertex) {

  var hasNucleotide = false;
  _.each(vertex.inEdges, function(e) {
    if (e.type === ATGC.DBN.NUCLEOTIDE) {
      hasNucleotide = true;
    }
  });
  _.each(vertex.outEdges, function(e) {
    if (e.type === ATGC.DBN.NUCLEOTIDE) {
      hasNucleotide = true;
    }
  });

  return hasNucleotide;

};



/**
 * if legal complete an edge between the two vertices
 * @param  {[type]} event [description]
 * @param  {[type]} v1    [description]
 * @param  {[type]} v2    [description]
 * @return {[type]}       [description]
 */
ATGC.App.prototype.onCompleteEdge = function(event, v1, v2) {

  // remove any previous alerts, this may generate new ones
  this.hideAlerts();

  // back to edit mode regardless of whether connection is valid
  this.enterState(ATGC.App.UI_FSM.EditGraph);

  // cannot connect to self and both vertices must exist
  if (!v2 || !v1 || v1.index === v2.index) {
    this.showError('That nucleotide connection is invalid.');
    return;
  }

  // if either vertex already has a nucleotide bond its invalid
  if (this.hasNucleotideBond(v1) || this.hasNucleotideBond(v2)) {
    this.showError('Existing nucleotide connection exists on that vertex.');
    return;
  }

  // validate nucleotide pairings
  if (!ATGC.DBN.validPair(v1.nucleotide, v2.nucleotide)) {
    this.showError('Invalid nucleotide pairing.');
    return;
  }

  // finally validate that the resulting DBN appears valid
  var temp = this.dbn.clone();
  var valid = temp.addConnection(v1.index, v2.index);

  if (valid) {
    // update the DBN and sequence text
    this.dbnInput.value = temp.dbn;
    this.dbn.dbn = temp.dbn;
    this.sequenceInput.value = temp.sequence;
    // add the edge
    this.graph.addEdge(v1, v2);

  } else {
    this.showError('That connection does not produce valid DBN');
  }

};


/**
 * when the user starts a drag on a vertex
 * @return {[type]} [description]
 */
ATGC.App.prototype.vertexPicked = function(event, vertex) {

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
 * @param  {Vector2D} p - display client point
 * @return {Graph Vertex} - optional
 */
ATGC.App.prototype.mouseMove = function(event, p, v) {

  // ignore unless we are dragging a vertex
  if (this.state === ATGC.App.UI_FSM.DragVertex) {

    // move the vertex element to given position and bring in/out edges with it
    this.graph.moveVertex(this.dragVertex, p);
  }

  // if we were given a vertex highlight in the DBN/sequence inputs
  if (v && this.dbn) {

    // highlight with an asterix
    var s = this.dbn.sequence;
    s = s.substr(0, v.index) + '*' + s.substr(v.index);
    this.sequenceInput.value = s;

    s = this.dbn.dbn;
    s = s.substr(0, v.index) + '*' + s.substr(v.index);
    this.dbnInput.value = s;
  }
};

/**
 * ensure the asterisks are removed from the inputs
 * @return {[type]} [description]
 */
ATGC.App.prototype.removeAsterisks = function() {

  // this removes all formatting as well
  this.sequenceInput.value = (this.sequenceInput.value || '').replace('*', '');
  this.dbnInput.value = (this.dbnInput.value || '').replace('*', '');

};

/**
 * get caret position of input and highlight that vertex with a signal
 * @param  {[type]} e [description]
 * @return {[type]}   [description]
 */
ATGC.App.prototype.onInputKeyup = function(e) {
  var index = this.getCaretPos(e.currentTarget);
  Events.I().publish(Events.HIGHLIGHT_VERTEX, index);
};

/**
 * get caret position in input
 * @param  {[type]} input [description]
 * @return {[type]}       [description]
 */
ATGC.App.prototype.getCaretPos = function(input) {

  if (document.selection && document.selection.createRange) {
    var range = document.selection.createRange();
    var bookmark = range.getBookmark();
    var caret_pos = bookmark.charCodeAt(2) - 2;
  } else {
    // Firefox Caret Position (TextArea)
    if (input.setSelectionRange)
      var caret_pos = input.selectionStart;
  }

  return caret_pos;
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
    // back to edit mode
    this.enterState(ATGC.App.UI_FSM.EditGraph);
  }
};

/**
 * display sequence was clicked
 * @return {[type]} [description]
 */
ATGC.App.prototype.onDisplaySequence = function() {
  // remove vertices to ensure a fresh layout
  this.vertices = null;
  this.enterState(ATGC.App.UI_FSM.NewSequence);
};

/**
 * the new sequence event was triggered
 * @return {[type]} [description]
 */
ATGC.App.prototype.onNewSequence = function() {
  this.enterState(ATGC.App.UI_FSM.NewSequence);
};

/**
 * parse query string parameters into object
 * @return {Object} parameter hash
 */
ATGC.App.prototype.getQueryStrings = function() {

  var assoc = {};
  var decode = function(s) {
    return decodeURIComponent(s.replace(/\+/g, " "));
  };
  var queryString = location.search.substring(1);
  var keyValues = queryString.split('&');

  for (var i in keyValues) {
    var key = keyValues[i].split('=');
    if (key.length > 1) {
      assoc[decode(key[0])] = decode(key[1]);
    }
  }
  return assoc;
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

    // initialize with default graph or load one from the server
    case ATGC.App.UI_FSM.Initialize:

      var id = this.getQueryStrings().sequence;
      if (id) {

        this.documentID = id;
        this.enterState(ATGC.App.UI_FSM.LoadSequence);

      } else {
        // set default sequence
        this.sequenceInput.value = 'CAGCACGACACUAGCAGUCAGUGUCAGACUGCAIACAGCACGACACUAGCAGUCAGUGUCAGACUGCAIACAGCACGACACUAGCAGUCAGUGUCAGACUGCAIA';
        this.dbnInput.value = '..(((((...(((((...(((((...(((((.....)))))...))))).....(((((...(((((.....)))))...))))).....)))))...)))))..';
        this.enterState(ATGC.App.UI_FSM.NewSequence);

      }

      break;

      // create a new sequence
    case ATGC.App.UI_FSM.CreateNew:

      this.documentID = null;
      this.sequenceInput.value = '';
      this.dbnInput.value = '';
      this.vertices = null;
      this.updateShareURL();
      this.graph.reset();

      this.showSuccess('Enter your new sequence into Nucleotides and DBN inputs below, then click Display');

      break;

      // load a sequence from this.documentID
    case ATGC.App.UI_FSM.LoadSequence:

      this.updateShareURL();

      X.Load(this.documentID, function(error, sequence, dbn, vertices) {

        if (error === K.API_NO_ERROR) {
          // display the sequence including validation
          this.sequenceInput.value = sequence;
          this.dbnInput.value = dbn;
          this.vertices = vertices;
          this.enterState(ATGC.App.UI_FSM.NewSequence);

        } else {
          this.showError(K.errorToString(error));

          // switch to edit mode
          this.enterState(ATGC.App.UI_FSM.EditGraph);
        }

      }.bind(this));

      break;

      // share the sequence, or simply display the URI we are already shared by
    case ATGC.App.UI_FSM.ShareSave:

      if (this.documentID) {

        // save existing document
        X.Save(this.documentID, this.dbn.sequence, this.dbn.dbn, this.graph.serializeVertices(), function(error) {

          if (error === K.API_NO_ERROR) {
            this.showSuccess('Your sequence was successfully saved.');
          } else {
            this.showError(K.errorToString(error));
          }

          // back to edit mode
          this.enterState(ATGC.App.UI_FSM.EditGraph);

        }.bind(this));

      } else {

        // create a new document
        X.Create(this.dbn, this.graph.serializeVertices(), function(error, id) {

          if (error === K.API_NO_ERROR) {
            this.showSuccess('Your sequence was successfully saved.');
            this.documentID = id;
            this.updateShareURL();
          } else {
            this.showError(K.errorToString(error));
          }

          // back to edit mode
          this.enterState(ATGC.App.UI_FSM.EditGraph);

        }.bind(this));
      }

      break;

      // validate and display new sequence
    case ATGC.App.UI_FSM.NewSequence:

      var dbn = new ATGC.DBN(this.sequenceInput.value, this.dbnInput.value);
      var error = dbn.validate();
      this.enterState(error ? ATGC.App.UI_FSM.SequenceError : ATGC.App.UI_FSM.DisplaySequence);

      break;

      // current sequence has an error, display it
    case ATGC.App.UI_FSM.SequenceError:

      var dbn = new ATGC.DBN(this.sequenceInput.value, this.dbnInput.value);
      this.showError(dbn.validate());

      break;

      // display a valid sequence
    case ATGC.App.UI_FSM.DisplaySequence:

      // sequence appears valid, display it
      this.dbn = new ATGC.DBN(this.sequenceInput.value, this.dbnInput.value);
      this.graph.showSequence(this.dbn, this.vertices);

      // if vertices positions available go to edit mode, otherwise start a layout
      if (this.vertices) {

        this.enterState(ATGC.App.UI_FSM.EditGraph);

      } else {
        // start a timer to improve the layout until we exit this state
        this.displayTimer = setInterval(this.evolveGraph.bind(this), ATGC.Display.kGRAPH_UPDATE_TIME * 2);
      }

      // hide any previous errors
      this.hideAlerts();

      break;

      // user is manipulating the graph
    case ATGC.App.UI_FSM.EditGraph:

      break;

    case ATGC.App.UI_FSM.CreateEdge:

      U.ASSERT(this.sourceVertex, 'Expected a source vertex');

      // the display will handle the actual drag operation
      Events.I().publish(Events.CONSTRUCT_EDGE, this.sourceVertex);

      break;

      // user is dragging a vertex
    case ATGC.App.UI_FSM.DragVertex:

      U.ASSERT(this.dragVertex, 'Expecting a vertex to be assigned to this.vertex');

      break;
  }
};

/**
 * update share URL if we have a document id
 * @return {[type]} [description]
 */
ATGC.App.prototype.updateShareURL = function() {

  if (this.documentID) {
    var url = _.sprintf('%s//%s/?sequence=%s',
      window.location.protocol,
      window.location.host,
      this.documentID);
    this.shareURL.value = url;
  } else {
    this.shareURL.value = '';
  }
};

/**
 * exit the current UI state
 * @return {[type]} [description]
 */
ATGC.App.prototype.exitState = function() {

  switch (this.state) {

    // cancel the update timer, if running
    case ATGC.App.UI_FSM.DisplaySequence:

      if (this.displayTimer) {
        clearInterval(this.displayTimer);
        this.displayTimer = null;
      }

      break;
  }

  this.state = ATGC.App.UI_FSM.None;
};

/**
 * update the graph display
 * @return {[type]} [description]
 */
ATGC.App.prototype.evolveGraph = function() {

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
  Events.I().publish(Events.NEW_SEQUENCE);

  // prevent form submission
  e.preventDefault();
  return true;
};

/**
 * hide all alerts
 * @return {[type]} [description]
 */
ATGC.App.prototype.hideAlerts = function() {
  this.alertSuccess.classList.add('hidden');
  this.alertError.classList.add('hidden');
};

/**
 * use modeless alert to show the error message
 */
ATGC.App.prototype.showError = function(msg) {

  // show error alert
  this.alertError.classList.remove('hidden');
  this.errorMessage.innerText = msg;
  this.alertSuccess.classList.add('hidden');
};

/**
 * use modeless alert to show the success message
 */
ATGC.App.prototype.showSuccess = function(msg) {

  // show success alert
  this.alertSuccess.classList.remove('hidden');
  this.alertSuccess.innerText = msg;
  this.alertError.classList.add('hidden');
};



/**
 * states for user interface finite state machine
 */
ATGC.App.UI_FSM = {

  // no state
  None: 'None',

  // initialize by loading a graph or showing the default one
  Initialize: 'Initialize',

  // validate and display a new sequence
  NewSequence: 'NewSequence',

  // sequence has an error, display it
  SequenceError: 'SequenceError',

  // display a valid sequence
  DisplaySequence: 'DisplaySequence',

  // user is editing the graph, but not actually doing anything at this time
  EditGraph: 'EditGraph',

  // user is dragging a vertex, this.dragVertex is the vertex
  DragVertex: 'DragVertex',

  // load a sequence
  LoadSequence: 'LoadSequence',

  // share the sequence
  ShareSequence: 'ShareSequence',

  // create a new sequence
  CreateNew: 'CreateNew',

  // create a new edge this.source should be the vertex to start from
  CreateEdge: 'CreateEdge'

};
