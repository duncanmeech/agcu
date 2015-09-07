var S = S || {};

/**
 * graphics settings with localstorage persistence.
 * Class is a singleton, use .I() accessor
 */
S = function() {

  this.baseColors = {
    A: '#1f77b4',
    T: '#aec7e8',
    G: '#ff7f0e',
    U: '#98df8a',
    I: '#d62728',
    C: '#9467bd'
  }

  this.baseSize = S.kNR;
  this.baseFont = "Arial";
  this.lineWidth = S.kLW;

};

S.kNR = 26;
S.kNR_MAX = 50;
S.kNR_MIN = 10;

S.kLW = 5;
S.kLW_MAX = 20;
S.kLW_MIN = 1;

/**
 * singleton accessor for Events instances
 * @return {Events}
 */
S.I = function() {
  if (!S._I) {
    S._I = new S();
  }
  return S._I;
};

/**
 * apply new settings and validate
 * @return {[type]} [description]
 */
S.prototype.apply = function(obj) {

  // base color e.g. A=RED or A=rgb(1,2,3)
  var a = obj.baseColor.split('=');
  if (a.length === 2) {
    var color = new net.brehaut.Color(a[1]);
    this.baseColors[a[0].toUpperCase()] = color.toCSS();
  }

  // base Size
  var s = parseFloat(obj.baseSize);
  if (s && !_.isNaN(s) && _.isNumber(s)) {
    this.baseSize = Math.max(S.kNR_MIN, Math.min(S.kNR_MAX, s));
  }

  // base Font (font validation is tricky...)
  if (obj.baseFont.trim()) {
    this.baseFont = obj.baseFont.trim();
  }

  // line width
  s = parseFloat(obj.lineWidth);
  if (s && !_.isNaN(s) && _.isNumber(s)) {
    this.lineWidth = Math.max(S.kLW_MIN, Math.min(S.kLW_MAX, s));
  }

};
