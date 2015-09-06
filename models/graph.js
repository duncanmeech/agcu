var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = mongoose.Schema.Types.ObjectId;
var uuid = require('node-uuid');
var config = require('../config/config.js');
var _ = require('underscore');

// constants shared with the client side code including all API error codes
var K = require('../public/javascripts/consts.js');


/**
 * basic document schema
 * @type {mongoose.Schema}
 */
var graphSchema = new Schema({

  // json / string that defines the graph
  json: {
    type: String,
    required: true,
    default: ""
  }

});


/**
 * create a new graph and associated with given json ( users can create/save documents locally until
 * registered / signed in);
 * @param user
 * @param {String} json
 * @param {Function} callback
 */
graphSchema.statics.create = function(document, callback) {

  // create new model
  var g = new graphModel({
    json: document
  });

  // save it and return the UUID of the document if no error
  g.save(function(err) {
    if (err) {
      callback(K.API_SAVE_ERROR);
    } else {
      callback(K.API_NO_ERROR, g._doc._id.toString());
    }
  });

};

/**
 * load an existing graph
 * @param  {Account} user
 * @param  {String} documentId
 * @param  {String} document
 * @return {String} uuid of document
 */
graphSchema.statics.load = function(documentId, callback) {

  graphModel.findOne({
      _id: documentId
    })
    .exec(function(err, graph) {

      if (!err && graph) {

        callback(K.API_NO_ERROR, graph.json);

      } else {
        callback(K.API_LOAD_ERROR);
      }
    });
};

/**
 * save an existing graph
 * @param  {Account} user
 * @param  {String} documentId
 * @param  {String} document
 * @return {String} uuid of document
 */
graphSchema.statics.save = function(documentId, document, callback) {

  graphModel.findOne({
    _id: documentId
  })
    .exec(function(err, graph) {

      if (!err && graph) {

        // update
        graph.json = document;

        // save it and return the UUID of the document if no error
        graph.save(function(err) {
          if (err) {
            callback(K.API_SAVE_ERROR);
          } else {
            callback(K.API_NO_ERROR);
          }
        });

      } else {
        callback(K.API_SAVE_ERROR);
      }
    });
};

/**
 * create the module which will be the sole export of this file
 */
var graphModel = mongoose.model('Graph', graphSchema);
module.exports = graphModel;
