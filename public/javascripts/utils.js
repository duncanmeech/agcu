var U = U || {};

/**
 * namespace for SVG elements
 * @const {string}
 */
U.SVGNS = "http://www.w3.org/2000/svg";

/**
 * namespace for xlink element e.g. <use href="xxx"/>
 * NOTE: You must use this or document.setAttributeNS will silently fail
 * @const {string}
 */
U.XLNS = "http://www.w3.org/1999/xlink";

/**
 * most basic assert possible
 * @param expression
 * @param message
 */
U.ASSERT = function (expression, message) {

  if (!expression) {
    console.error(message);
    debugger;
    throw new Error(message);
  }
};

/**
 * returns true if the object constructor has strict equality with the class ( by comparing the
 * constructor of the obj)
 * @param object
 * @param klass - a variable list of classes
 * @constructor
 */
U.IS_A = function(obj, classes) {

  for(var i = 1; i < arguments.length; i += 1) {
    if (obj.constructor === arguments[i]) {
      return true;
    }
  }

  return false;
};

/**
 * return true iff the value is a number that is not NaN or Infinity
 * @param {Number} v
 * @returns Boolean
 */
U.IS_NUMBER = function(v) {
  return _.isNumber(v) && !_.isNaN(v) &&_.isFinite(v);
};

/**
 * return true iff the value is a number that is not NaN or Infinity and is >= zero
 * @param {Number} v
 * @returns Boolean
 */
U.IS_POSITIVE_NUMBER = function(v) {
  return U.IS_NUMBER(v) && v >= 0;
};

/**
 * degrees to radians
 * @param d
 * @returns {number}
 * @constructor
 */
U.D2R = function (d) {
  return  d * (Math.PI / 180);
};

/**
 * radians to degrees
 * @param r
 * @returns {number}
 * @constructor
 */
U.R2D = function(r) {
  return r * (180 / Math.PI);
};

/**
 * given a signed angle in degrees return a positive value between 0 -- 360
 * e.g. -45 return 315, 721 returns 1
 * @param d
 */
U.PA = function (d) {

  var temp = d % 360;
  if (temp < 0) {
    temp = 360 + temp;
  }
  return temp;
};

/**
 * returns true if a is almost the same as b
 * @param {Number} a
 * @param {Number} b
 */
U.NEARLY = function(a, b) {
  var d = Math.abs(b - a);
  return d <= 1e-6;
};
U.ZERO = function(a) {
  return U.NEARLY(a, 0);
};
U.ONE = function(a) {
  return U.NEARLY(a, 1);
};

/**
 * JSON dump of given object
 */
U.DUMP = function(obj) {
  return JSON.stringify(obj, null, 2);
};

/**
 * extend the given object with the given arguments, via a map of
 * names to property values. This is more flexible than a simple _.extend operation
 * since a single property can be set by any number of other properties e.g.
 * given a map like:
 * {
 *  x   : 'x',
 *  y   : 'y',
 *  left: 'x',
 *  top : 'y'
 * }
 *
 * Any values of x or left in args would be mapped to the x property of obj
 *
 * @param dest  - the object to extend with properties from src
 * @param src - the object we will take arguments from
 * @param map - the map of properties names in to properties of obj
 */
U.extendWithMap = function(dest, src, map) {

  _.each(src, function(value, key) {

    if (_.has(map, key)) {
      dest[map[key]] = value;
    }

  });

};

/**
 * This is the most basic way to implement class inheritance in JavaScript.
 * The prototype property of the progeny class ( the new class ) is simply copied from the prototype property
 * if the progenitor class ( the base class ). After that we simple ensure that the correct constructor
 * function is called when creating new instances of progeny.
 *
 * @param {Function} progenitor - the base class ( constructor )
 * @param {Function} progeny - the extended ( inheriting ) class ( constructor )
 */
U.extends = function (progenitor, progeny) {

  /* progeny is prototyped from its progenitor */
  progeny.prototype = Object.create(progenitor.prototype);

  /* make the constructor for the progeny references itself and not the progenitor constructor */
  progeny.prototype.constructor = progeny;
};

/**
 * return the value rounded to a half pixel
 * @param v
 * @constructor
 */
U.HP = function(v) {
  return Math.floor(v) + 0.5;
};

/**
 * return the value rounded to a pixel
 * @param v
 * @constructor
 */
U.P = function(v) {
  return Math.floor(v);
};
