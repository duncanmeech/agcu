/**
 * Contains constants that are shared between client and server, literally...this file is included in
 * client side views and within the node-js code
 */

var K = {

  // API error codes

  API_NO_ERROR: 0,
  API_LOAD_ERROR: 1,
  API_SAVE_ERROR: 2,
  API_ERROR_UNKNOWN: -1,

};

/**
 * returns a string message for a constants representing an API error
 * @param error
 * @returns {string}
 */
K.errorToString = function(error) {

  switch (error) {
    case K.API_NO_ERROR:
      return 'No Error';
    case K.API_GRAPH_LOAD_ERROR:
      return 'Unable to load the graph.';
    case K.API_GRAPH_SAVE_ERROR:
      return 'Unable to save the graph.';
    default:
      return 'Unrecognized error. You might not be able to connect to the server right now.';
  }

};

if (module) {
  module.exports = K;
}
