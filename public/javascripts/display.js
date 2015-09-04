var ATGC = ATGC || {};

/**
 * primary display surface for graph, mutates the element it is
 * given into the required type
 * @param {HTMLElement} el
 */
ATGC.Display = function(el) {

  this.el = el;
  this.el.classList.add('display-surface');
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
};

/**
 * callback from graph when we should create a vertex element
 * @param  {ATGC.core.GraphVertex} vertex
 */
ATGC.Display.prototype.createVertex = function(vertex) {
  console.log('create vertex');
};

/**
 * callback from graph when we should create an edge element
 * @param  {ATGC.core.GraphEdge} edge
 */
ATGC.Display.prototype.createEdge = function(vertex) {
  console.log('create edge');
};

/**
 * callback from layout strategy when we should create an edge element
 * @param  {ATGC.core.GraphEdge} vertex - vertex to update
 * @param {Object} element - display element for vertex
 * @param {G.Vector2D} vector - point/vector of vertex position
 */
ATGC.Display.prototype.updateVertex = function(vertex, element, vector) {
  console.log('update vertex');
};

/**
 * update the display attributes / end points of an edge
 * @param  {ATGC.core.GraphEdge} edge - edge to update
 * @param  {Object} element - display element
 * @param  {G.Vector2D} v1 - start of line segment
 * @param  {G.Vector2D} v2 - end of line segment
 */
ATGC.Display.prototype.updateEdge = function(edge, element, v1, v2) {
  console.log('update edge');
};
