var ATGC = ATGC || {};



/**
 * nucleotides are the vertices in our directed graph
 * @param {[type]} nucleotide [description]
 */
ATGC.Nucleotide = function(nucleotide) {

  this.nucleotide = nucleotide;
  this.el = document.createElement('div');
  this.el.classList.add('nucleotide');
  this.el.style.width = _.sprintf('%spx', S.I().baseSize);
  this.el.style.height = _.sprintf('%spx', S.I().baseSize);
  this.el.style.fontFamily = S.I().baseFont;

  this.tel = document.createElement('div');
  this.tel.classList.add('nucleotide-text');
  this.tel.innerText = this.nucleotide;
  this.el.appendChild(this.tel);

  var color = S.I().baseColors[this.nucleotide];
  U.ASSERT(color, 'No color for given text');
  this.el.style.backgroundColor = color;
};

/**
 * update position of the vertex / nucleotide
 * @param  {Vector2D} vector
 */
ATGC.Nucleotide.prototype.updatePosition = function(vector) {
  this.el.style.left = vector.x + 'px';
  this.el.style.top = vector.y + 'px';
};

/**
 * all edges are represented with simple DOM based div elements, transformed to appear as a line
 */
ATGC.Edge = function(graphedge) {

  // create edge element
  this.el = document.createElement('div');
  this.el.classList.add('edge');

  // style according to type of edge
  switch (graphedge.type) {

    case ATGC.DBN.NUCLEOTIDE:
      this.thickness = S.I().lineWidth;
      this.color = '#d62728';
      break;

    case ATGC.DBN.BACKBONE:
      this.thickness = 3;
      this.color = 'lightgray';
      break;
  }
};

/**
 * update the end points of the edge
 * @param  {Vector2D} p1
 * @param  {Vector2D} p2
 */
ATGC.Edge.prototype.updatePosition = function(p1, p2) {

  // record end points of line
  this.start = p1;
  this.end = p2;

  // now calculate the length of the line which becomes the width of the div
  var len = Math.sqrt(((p2.x - p1.x) * (p2.x - p1.x)) + ((p2.y - p1.y) * (p2.y - p1.y)));

  // first calculate the angle from this.x/this.y to this.p2.x/this.p2.y
  var rads = Math.atan2(p2.y - p1.y, p2.x - p1.x);

  // atan2 return negative PI radians for the 180-360 degrees ( 9 o'clock to 3 o'clock )
  if (rads < 0) {
      rads = 2 * Math.PI + rads;
  }

  // now calculate the length of the line which becomes the width of the div
  len = Math.sqrt(((p2.x - p1.x) * (p2.x - p1.x)) + ((p2.y - p1.y) * (p2.y - p1.y)));

  // get total thickness of line
  var t = this.thickness;

  // update our style properties with the appropriate transform for the line

  this.el.style.width = _.sprintf('%.0fpx', len);
  this.el.style.height = _.sprintf('%.0fpx', t);
  this.el.style.borderRadius = _.sprintf('%.0fpx', t / 2);

  var origin = _.sprintf('0px %.0fpx', t / 2);
  var transform = _.sprintf('translate(%.0fpx, %.0fpx) rotate(%.2frad)', p1.x, p1.y - t / 2, rads);
  this.el.style.transformOrigin = origin;
  this.el.style.transform = transform;

  // finally, set color of edge
  this.el.style.backgroundColor = this.color;

};
