var express = require('express');
var router = express.Router();
var graph = require('../models/graph');
var K = require('../public/javascripts/consts');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Nucleotides by Duncan Meech' });
});

/* save a document */
router.get('/api/create/:seq/:dbn', function(req, res, next) {

  // create a JSON string object from the sequence and dbn
  var document = JSON.stringify({
    sequence: req.params.seq,
    dbn: req.params.dbn
  });

  // create and save the document, returning the error code
  // and document id to the user
  graph.create(document, function(error, id) {
    res.send({
      error: error,
      id: id
    });
  });

});

/* load a document */
router.get('/api/load/:id', function(req, res, next) {

  var document = graph.load(req.params.id, function(error, document) {

    var temp = JSON.parse(document);

    res.send({
      error: K.API_NO_ERROR,
      sequence: temp.sequence,
      dbn: temp.dbn
    });
  });
});

/* save / update an existing document */
router.get('/api/save/:id/:seq/:dbn', function(req, res, next) {

  // create a JSON string object from the sequence and dbn
  var document = JSON.stringify({
    sequence: req.params.seq,
    dbn: req.params.dbn
  });

  var document = graph.save(req.params.id, document, function(error) {

    res.send({
      error: error
    });
  });
});



module.exports = router;
