var ATGC = ATGC || {};

/**
 * primary display surface for graph, mutates the element it is
 * given into the required type
 * @param {HTMLElement} el
 */
ATGC.Display = function(el) {

  this.el = el;
  this.el.classList.add('display-surface');

  // sink mouse events on our display element
  this.el.addEventListener('mousedown', this.mouseDown.bind(this));
  this.el.addEventListener('mousemove', this.mouseMove.bind(this));
  this.el.addEventListener('mouseup', this.mouseUp.bind(this));
};

/**
 * mouse move handler
 * @param  {[type]} e [description]
 * @return {[type]}   [description]
 */
ATGC.Display.prototype.mouseDown = function(e) {

  // transform point
  var p = D.mouseToLocal(e, this.el);
  var v = this.findVertex(p);

  // signal that the user has grabbed a vertex
  if (v) {
    Events.I().publish(Events.VERTEX_PICKED, v);
  }
};

/**
 * mouse move handler
 * @param  {[type]} e [description]
 * @return {[type]}   [description]
 */
ATGC.Display.prototype.mouseMove = function(e) {

  var p = D.mouseToLocal(e, this.el);
  var v = this.findVertex(p);
  Events.I().publish(Events.MOUSE_MOVE, p, v);

};

/**
 * mouse up handler
 * @param  {[type]} e [description]
 * @return {[type]}   [description]
 */
ATGC.Display.prototype.mouseUp = function(e) {

  var p = D.mouseToLocal(e, this.el);
  Events.I().publish(Events.MOUSE_UP, p);

};

/**
 * return the vertex at the given display coordinates
 * @param  {[type]} p [description]
 * @return {[type]}   [description]
 */
ATGC.Display.prototype.findVertex = function(sp) {

  var hit = null;
  this.layout.eachVertex(function(v) {

    // get location of vertex element
    var vx = parseFloat(v.element.el.style.left);
    var vy = parseFloat(v.element.el.style.top);

    // get distance to point location
    var d = new ATGC.layout.Line(sp.x, sp.y, vx, vy).length;

    // if distance is within radius of vertex then its a hit
    if (d < ATGC.kNR / 2) {
      hit = v;
    }

  }.bind(this));

  return hit;
};

/**
 * move the vertex/nucleotide and adjust any in/out edges
 * @param  {[type]} vertex [description]
 * @param  {[type]} p      [description]
 * @return {[type]}        [description]
 */
ATGC.Display.prototype.moveVertex = function(vertex, p) {

  // move vertex itself
  vertex.element.updatePosition(p);

  // update end point of in edges
  _.each(vertex.inEdges, function(e) {
    e.element.updatePosition(e.element.start, p);
  });

  // update outbound edges
  _.each(vertex.outEdges, function(e) {
    e.element.updatePosition(p, e.element.end);
  });

};

/**
 * clear the current display
 */
ATGC.Display.prototype.reset = function () {

  // clear the current graph and DBN
  D.empty(this.el);
  this.dbn = null;
  this.layout = null;
};

/**
 * show the given sequence, which we assume is valid
 * @param  {ATGC.DBN} dbn
 */
ATGC.Display.prototype.showSequence = function(dbn) {

  U.ASSERT(dbn && !dbn.validate(), 'Bad Sequence');

  // clear and current graph
  D.empty(this.el);

  // save current sequence and derive directed graph
  this.dbn = dbn;
  this.graph = new ATGC.core.Graph({
    createVertex: this.createVertex.bind(this),
    createEdge: this.createEdge.bind(this),
    updateVertex: this.updateVertex.bind(this),
    updateEdge: this.updateEdge.bind(this)
  });
  this.dbn.populateGraph(this.graph);

  // create a layout strategy and perform initial update
  this.layout = new ATGC.layout.GraphForceDirected(this.graph, {});

  // perform a short initial layout.
  this.layout.update(this.getDisplayBounds(), ATGC.Display.kGRAPH_UPDATE_TIME);

};

/**
 * improve and update the current layout, unless the graph has stabalized
 */
ATGC.Display.prototype.continueLayout = function() {

  if (this.layout && this.layout.totalEnergy() > 0.01) {
    this.layout.update(this.getDisplayBounds(), ATGC.Display.kGRAPH_UPDATE_TIME);
  }
};


/**
 * get the current display bounds, inset to allow for the maximum size
 * of graph vertices
 * @return {[type]} [description]
 */
ATGC.Display.prototype.getDisplayBounds = function() {

  return new ATGC.layout.Box(ATGC.kNR_MAX, ATGC.kNR_MAX, this.el.clientWidth - ATGC.kNR_MAX * 2, this.el.clientHeight - ATGC.kNR_MAX * 2);
};

/**
 * ms per update cycle of the force directed graph
 * @type {Number}
 */
ATGC.Display.kGRAPH_UPDATE_TIME = 50;

/**
 * callback from graph when we should create a vertex element
 * @param  {ATGC.core.GraphVertex} vertex
 */
ATGC.Display.prototype.createVertex = function(vertex) {
  var v = new ATGC.Nucleotide(vertex.nucleotide);
  this.el.appendChild(v.el);
  return v;
};

/**
 * callback from graph when we should create an edge element
 * @param  {ATGC.core.GraphEdge} graphedge
 */
ATGC.Display.prototype.createEdge = function(graphedge) {
  var e = new ATGC.Edge(graphedge);
  this.el.appendChild(e.el);
  return e;
};

/**
 * callback from layout strategy when we should create an edge element
 * @param  {ATGC.core.GraphEdge} vertex - vertex to update
 * @param {ATGC.Nucleotide} element - display element for vertex
 * @param {ATGC.layout.Vector} vector - point/vector of vertex position
 */
ATGC.Display.prototype.updateVertex = function(vertex, nucleotide, vector) {
  nucleotide.updatePosition(vector);
};

/**
 * update the display attributes / end points of an edge
 * @param  {ATGC.core.GraphEdge} edge - edge to update
 * @param  {ATGC.Edge} element - graph edge display element
 * @param  {ATGC.layout.Vector} v1 - start of line segment
 * @param  {ATGC.layout.Vector} v2 - end of line segment
 */
ATGC.Display.prototype.updateEdge = function(graphedge, edge, v1, v2) {
  edge.updatePosition(v1, v2);
};
