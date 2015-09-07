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
  this.el.addEventListener('mouseenter', this.mouseEnter.bind(this));
  this.el.addEventListener('mouseleave', this.mouseLeave.bind(this));

  // listen for certain app events as well
  Events.I().subscribe(Events.HIGHLIGHT_VERTEX, this.highlightVertex.bind(this));

  Events.I().subscribe(Events.CONSTRUCT_EDGE, this.onConstructEdge.bind(this));
};

/**
 * mouse move handler
 * @param  {[type]} e [description]
 * @return {[type]}   [description]
 */
ATGC.Display.prototype.mouseEnter = function(e) {
  Events.I().publish(Events.MOUSE_ENTER);
};
ATGC.Display.prototype.mouseLeave = function(e) {
  Events.I().publish(Events.MOUSE_LEAVE);
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
    if (e.shiftKey) {
      Events.I().publish(Events.NEW_EDGE, v);
    } else {
      Events.I().publish(Events.VERTEX_PICKED, v);
    }
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

  if (this.sourceVertex) {

    // we are dragging an edge
    this.edgeLine.updatePosition(this.edgeLine.start, p);

  } else {

    // publish the event to the world

    Events.I().publish(Events.MOUSE_MOVE, p, v);
  }

  // stop the browsers default action for mouse drags e.g. selection etc
  e.preventDefault();
  e.stopPropagation();
  return true;

};

/**
 * mouse up handler
 * @param  {[type]} e [description]
 * @return {[type]}   [description]
 */
ATGC.Display.prototype.mouseUp = function(e) {

  var p = D.mouseToLocal(e, this.el);

  // consume the event if the user is dragging an edge, otherwise publish globally
  if (this.sourceVertex && this.edgeLine) {

    var v = this.findVertex(p);

    // publish event to indicate possible new edge creation
    Events.I().publish(Events.COMPLETE_EDGE, this.sourceVertex, v);

    // remove the temporary display element
    this.el.removeChild(this.edgeLine.el);
    this.sourceVertex = null;
    this.edgeLine = null;

  } else {
    Events.I().publish(Events.MOUSE_UP, p);
  }

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
    if (d < ATGC.kNR) {
      hit = v;
    }

  }.bind(this));

  return hit;
};

/**
 * highlight a vertex indicated by the given index
 * @param  {[type]} event [description]
 * @param  {[type]} index [description]
 * @return {[type]}       [description]
 */
ATGC.Display.prototype.highlightVertex = function(event, index) {

  var v = null;
  this.layout.eachVertex(function(_v) {
    if (_v.index === index) {
      v = _v;
    }
  });

  // if we found a vertex then highlight it for a short while
  if (v) {
    v.element.el.classList.add('nucleotide-highlighted');
    _.delay(function() {
      v.element.el.classList.remove('nucleotide-highlighted');
    }, 400);
  }
};

/**
 * start constructing an edge from the given source vertex
 * @param  {[type]} sourceVertex [description]
 * @return {[type]}              [description]
 */
ATGC.Display.prototype.onConstructEdge = function(event, sourceVertex) {

  this.sourceVertex = sourceVertex;
  this.edgeLine = new ATGC.Edge({
    type: ATGC.DBN.NUCLEOTIDE
  });
  this.el.appendChild(this.edgeLine.el);

  var x = parseFloat(sourceVertex.element.el.style.left);
  var y = parseFloat(sourceVertex.element.el.style.top);

  this.edgeLine.updatePosition(new ATGC.layout.Vector(x, y), new ATGC.layout.Vector(x, y));

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
ATGC.Display.prototype.reset = function() {

  // clear the current graph and DBN
  D.empty(this.el);
  this.dbn = null;
  this.layout = null;
};

/**
 * show the given sequence, which we assume is valid.
 * The vertices, if present, are the normalized, serialized
 * position of the graph when it was saved.
 * @param  {ATGC.DBN} dbn
 * @param {Array of Vertices}
 */
ATGC.Display.prototype.showSequence = function(dbn, vertices) {

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

  if (vertices) {

    // restore serialized, normalize vertices
    this.restoreVertices(vertices);

  } else {

    // perform a short initial layout.
    this.layout.update(this.getDisplayBounds(), ATGC.Display.kGRAPH_UPDATE_TIME);
  }

};

/**
 * add an edge between two existing vertices. Used when the user has dragged out a new edge
 * @param  {[type]} v1 [description]
 * @param  {[type]} v2 [description]
 * @return {[type]}    [description]
 */
ATGC.Display.prototype.addEdge = function(v1, v2) {

  // create and position edge
  var edge = this.graph.addEdge(v1, v2, {
    type: ATGC.DBN.NUCLEOTIDE
  });

  var x1 = parseFloat(v1.element.el.style.left);
  var y1 = parseFloat(v1.element.el.style.top);
  var x2 = parseFloat(v2.element.el.style.left);
  var y2 = parseFloat(v2.element.el.style.top);

  this.updateEdge(edge, edge.element, new ATGC.layout.Vector(x1, y1), new ATGC.layout.Vector(x2, y2));

};

/**
 * restore position of vertices
 * @param  {[type]} vertices [description]
 * @return {[type]}          [description]
 */
ATGC.Display.prototype.restoreVertices = function(vertices) {

  var b = this.getDisplayBounds();

  // update edges first, then vertices
  //
  this.layout.eachVertex(function(v) {

    var x = vertices[v.index].x * b.w;
    var y = vertices[v.index].y * b.h;

    // apply position to start/end edges connected to this vertex as well
    _.each(v.inEdges, function(e) {
      e.element.end = new ATGC.layout.Vector(x, y);
    });
    _.each(v.outEdges, function(e) {
      e.element.start = new ATGC.layout.Vector(x, y);
    });

  }.bind(this));

  this.layout.eachVertex(function(v) {

    var x = vertices[v.index].x * b.w;
    var y = vertices[v.index].y * b.h;
    this.moveVertex(v, new ATGC.layout.Vector(x, y));

  }.bind(this));

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
 * return the normalized position of all vertices in the graph as
 * string that can be parsed by JSON.parse back into an array of x/y objects
 * @return {String}
 */
ATGC.Display.prototype.serializeVertices = function() {

  var b = this.getDisplayBounds();
  var vertices = [];

  this.layout.eachVertex(function(v) {

    var x = parseFloat(v.element.el.style.left);
    var y = parseFloat(v.element.el.style.top);

    vertices.push({
      x: x / b.w,
      y: y / b.h
    });
  });
  return JSON.stringify(vertices);
};

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
