
var D = D || {};

/**
 * remove all the children of the given element
 * @param element
 */
D.empty = function(element) {

  U.ASSERT(element, 'Bad parameter');

  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }

};

/**
 * append a string to the end of the given HTMLElement
 * @param {HTMLElement} parent
 * @param {String} html
 * @returns {Node}
 */
D.appendString = function(parent, html) {

  U.ASSERT(parent && parent.tagName, 'Bad parameter');

  U.ASSERT(_.isString(html), 'Bad parameter');

  parent.insertAdjacentHTML('beforeend', html);

  return parent.lastChild;
};

/**
 * given a string representation of an complete SVG, create and return an SVGElement
 * @param  {String} s
 * @return {SVGElement}
 */
D.stringToSVG = function(s) {

  U.ASSERT(s, 'Bad parameter');

  // create a temporary DIV to parent to
  var d = document.createElement('div');
  D.appendString(d, s.trim());

  // find the first SVG tag ( there might be XML / TextNode elements etc )
  var svg = d.querySelector('svg');
  U.ASSERT(svg, 'Did not find SVG tag as expected');
  d.removeChild(svg);
  return svg;
};

/**
 * return the dimensions of an SVG using the width/height attribute or the viewBox
 * @param  {SVGElement} svge
 * @return {G.Vector2D}
 */
D.svgSize = function(svge) {

  var width = 0;
  var height = 0;

  // parse 4 signed floats separated by whitespace or a comma with optional whitespace

  var r = /^\s*(-?\d*\.?\d*)(?:\s+|\s*,\s*)(-?\d*\.?\d*)(?:\s+|\s*,\s*)(-?\d*\.?\d*)(?:\s+|\s*,\s*)(-?\d*\.?\d*)\s*$/;

  var viewBox = r.exec(svge.getAttribute('viewBox'));

  if (svge.hasAttribute('width')) {
    width = D.toPixels(svge.getAttribute('width'));
  } else {
    if (viewBox) {
      width = parseFloat(viewBox[3]);
    }
  }

  if (svge.hasAttribute('height')) {
    height = D.toPixels(svge.getAttribute('height'));
  } else {
    if (viewBox) {
      height = parseFloat(viewBox[4]);
    }
  }

  return new G.Vector2D(width, height);
};

var units = {};

/**
 * convert from common units using the given DPI as a basis.
 * Acceptable units are 'px', 'in', 'cm', 'pt', 'pc'
 * @param {Number} from
 * @param {String} fromUnits
 * @param {String} toUnits
 * @param {Number} [_dpi] - defaults to 96
 *
 */
D.convertUnits = function(from, fromUnits, toUnits, _dpi) {

  U.ASSERT(U.IS_NUMBER(from), 'Bad parameter');

  var dpi = _dpi || 96;

  U.ASSERT(U.IS_POSITIVE_NUMBER(dpi), 'Bad parameter');

  var map = {
    'px': 1,
    'in': dpi,
    'pt': dpi / 72,
    'pc': dpi / 6,
    'mm': dpi / 25.4,
    'cm': dpi / 2.54
  };

  var _units = Object.keys(map);

  U.ASSERT(_units.indexOf(fromUnits) >= 0 && _units.indexOf(toUnits) >= 0, 'Bad units');

  var pixels = from * map[fromUnits];

  return pixels / map[toUnits];
};

/**
 * short hand version of convertUnits, that always returns the px equivalent of the given string
 * e.g. given ("100px", 100) would return 100, or ("1in", 72) would return 72
 * @param s
 * @param _dpi
 * @constructor
 */
D.toPixels = function(s, _dpi) {

  var parts = /^\s*(\d*\.?\d*)\s*(px|in|pt|pc|mm|cm)?\s*$/;

  var match = parts.exec(s);

  U.ASSERT(match, 'Could not parse');

  var _units = match[2] || 'px';
  var from = parseFloat(match[1]);

  return D.convertUnits(from, _units, 'px', _dpi);
};


/**
 * import all the elements with 'data-element="XYZ" using the value of the attribute onto target
 * @param element
 * @param target
 */
D.importElements = function(element, target) {

  U.ASSERT(element && target, 'Bad parameters');

  _.each(element.querySelectorAll('[data-element]'), function(element) {

    var name = element.getAttribute('data-element');

    target[name] = element;

  }, this);

};

/**
 * return current scroll offset for element as a vector
 * @param element
 */
D.scrollOffset = function(element) {

  U.ASSERT(element, "Bad parameter");
  return new G.Vector2D(element.scrollLeft, element.scrollTop);
};

/**
 * return the top/left of the element relative to the document. Includes any scrolling.
 * @param {HTMLElement} element
 * @returns {{left: Number, top: Number}}
 */
D.documentOffset = function(element) {

  U.ASSERT(element, 'Bad parameter');

  // use the elements offset + the nearest positioned element, back to the root to find
  // the absolute position of the element

  var curleft = element.offsetLeft,
    curtop = element.offsetTop;

  while (element.offsetParent) {

    element = element.offsetParent;

    curleft += element.offsetLeft;
    curtop += element.offsetTop;

  }

  return {
    left: curleft,
    top: curtop
  };

};

/**
 * Get the client area coordinates for a given mouse event and HTML element.
 * @param {MouseEvent} e - mouse event you are interested in
 * @param {HTMLElement} element - element for which you want local coordinates
 */
D.mouseToLocal = function(e, element) {

  U.ASSERT(e && element, 'Bad parameters');

  // get the position in document coordinates, allowing for browsers that don't have pageX/pageY

  var pageX = e.pageX;
  var pageY = e.pageY;
  if (pageX === undefined) {
    pageX = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
    pageY = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
  }

  return D.globalToLocal(new G.Vector2D(pageX, pageY), element);
};

/**
 * convert page coordinates into local coordinates
 * @param v
 * @param element
 * @returns {G.Vector2D}
 */
D.globalToLocal = function(v, element) {

  U.ASSERT(v && element, 'Bad parameters');
  var p = D.documentOffset(element);
  return new G.Vector2D(v.x - p.left, v.y - p.top);

};

/**
 * reverse/opposite of mouseToLocal/globalToLocal, converts a x/y point in client area coordinates
 * to document coordinates ( page )
 * @param {G.Vector2D} v
 * @param {HTMLElement} element
 * @returns {G.Vector2D}
 */
D.localToGlobal = function(v, element) {

  U.ASSERT(v && element, 'Bad parameters');
  var p = D.documentOffset(element);
  return new G.Vector2D(v.x + p.left, v.y + p.top);
};

/**
 * convert the local coordinates of a point in source to local coordinates of a point in destination
 * @param v
 * @param source
 * @param destination
 */
D.localToLocal = function(v, source, destination) {

  U.ASSERT(v && source && destination, 'Bad parameters');
  return D.globalToLocal(D.localToGlobal(v, source), destination);
};

/**
 * principally designed to set attributes, recursively, on an SVG element
 * and all child elements. Child elements are ONLY changed if they specify
 * the given attribute. Since it is permissible to use inline CSS to set
 * SVG display attributes we also check for inline on the elements
 *
 * e.g. given
 * <svg>
 *   <g>
 *    <path stroke="red" style="fill:#000000">...</path>
 *   </g>
 * </svg>
 *
 * calling with tag === the <g> tag about and "stroke", "blue"
 * would result in
 *
 * <svg>
 *   <g stroke="blue">
 *    <path stroke="blue" style="fill:#000000">...</path>
 *   </g>
 * </svg>
 *
 * calling with tag === the <g> tag about and "fill", "red"
 * would result in
 *
 * <svg>
 *   <g fill="red">
 *    <path stroke="blue" style="fill:rgb(255,0,0)>...</path>
 *   </g>
 * </svg>
 *
 *
 * @param name
 * @param value
 */
D.setSVGAttribute = function(tag, name, value) {

  // set attribute on top level tag via attribute and inline CSS if present
  tag.setAttribute(name, value);
  if (tag.style[name]) {
    tag.style[name] = value;
  }

  // apply children that specify the given attribute
  var withAttribute = tag.querySelectorAll('[' + name + ']');
  _.each(withAttribute, function(tag) {
    tag.setAttribute(name, value);
  }, this);

  // apply via CSS as well as necessary

  var styledElements = tag.querySelectorAll('[style]');
  _.each(styledElements, function(styled) {
    if (styled.style[name]) {
      styled.style[name] = value;
    }
  }, this);

};

/**
 * calculate the correct browser prefix for this machine and save in the D.browserPrefix object.
 * This is subsequently used by the D.setPrefixedStyle api
 */
D.findBrowserPrefix = function() {

  if (!D.browserPrefix) {
    var styles = window.getComputedStyle(document.documentElement, ''),
      pre = (Array.prototype.slice
        .call(styles)
        .join('')
        .match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o'])
      )[1],
      dom = ('WebKit|Moz|MS|O').match(new RegExp('(' + pre + ')', 'i'))[1];

    D.browserPrefix = {
      dom: dom,
      lowercase: pre,
      css: '-' + pre + '-',
      js: pre[0].toUpperCase() + pre.substr(1)
    };
  }
};

/**
 * apply the given named css style and value to the given element. Applies the prefixed version first
 * and then the unprefixed version
 * @param {HTMLElement} element
 * @param {String} name - css property to set e.g. calling with 'transform' might set -webkit-transform and transform
 * @param {String} value - value to apply
 */
D.setPrefixedCSS = function(element, name, value) {

  // ensure the browser prefix has been calculated
  D.findBrowserPrefix();

  // apply
  element.style[D.browserPrefix.css + name] = value;
  element.style[name] = value;
};

/**
 * add the space separated classes to the classList property of the given element
 * or array of elements
 * @param element
 * @param classes
 */
D.addClasses = function(element, classes) {

  U.ASSERT(element && classes, 'Bad parameters');
  var elements = _.isArray(element) ? element : [element];

  _.each(classes.split(' '), function(klass) {
    elements.forEach(function(e) {
      e.classList.add(klass);
    });
  });
};

/**
 * remove the space separated classes to the classList property of the given element(s)
 * @param element
 * @param classes
 */
D.removeClasses = function(element, classes) {

  U.ASSERT(element && classes, 'Bad parameters');
  var elements = _.isArray(element) ? element : [element];

  _.each(classes.split(' '), function(klass) {
    elements.forEach(function(e) {
      e.classList.remove(klass);
    });

  });
};

/**
 * conditionally add/remove classes
 */
D.addRemoveClasses = function(element, classes, b) {
  if (b) {
    D.addClasses(element, classes);
  } else {
    D.removeClasses(element, classes);
  }
};

/**
 * toggle the space separated classes to the classList property of the given element
 * @param element
 * @param classes
 */
D.toggleClasses = function(element, classes) {

  U.ASSERT(element && classes, 'Bad parameters');

  _.each(classes.split(' '), function(klass) {
    // protect against class names separated by more than one space
    if (klass) {
      element.classList.toggle(klass);
    }
  });
};

/**
 * remove element and return null. The element can be null and since the
 * function returns null can be used a single line / syntactic sugar
 * for removing an element and assigning to null, regardless of whether it exists e.g.
 *
 * this.something = D.removeElement(this.something);
 *
 * @param  {[type]} element [description]
 * @return {[type]}         [description]
 */
D.removeElement = function(element) {

  if (element && element.parentElement) {
    element.parentElement.removeChild(element);
  }
  return null;
};

/**
 * set all the key/value pairs on the given element OR array of elements
 * @param {[type]} element    [description]
 * @param {[type]} properties [description]
 */
D.setAttributes = function(element, properties) {

  var elements = _.isArray(element) ? element : [element];
  _.each(properties, function(value, key) {
    _.each(elements, function(e) {
      e.setAttribute(key, value);
    });
  });

};

/**
 * return a unique ID using the given base string as prefix + '-'
 * @param  {[type]} base [description]
 * @return {[type]}      [description]
 */
D.uniqueID = function(base) {
  U.ASSERT(base && _.isString(base), "Bad parameter");
  return base + '-' + D.uniqueIDNext++;
};
D.uniqueIDNext = 0;

/**
 * if the element has a parent, remove the given element as a child
 * @param  {HTMLElement} el
 */
D.detach = function(el) {
  if (el.parentElement) {
    el.parentElement.removeChild(el);
  }
};
