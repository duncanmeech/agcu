var ATGC = ATGC || {};

/**
 * represents a DBN sequence. Can validate and parse the sequence into a graph.
 * @constructor
 * @param {String} sequence
 * @param {String} dbn
 */
ATGC.DBN = function (sequence, dbn) {

  // sequence should be upper case with no white space at either end
  this.sequence = sequence ? _.trim(sequence.toUpperCase()) : sequence;
  // dbn should not have white space either
  this.dbn = dbn ? _.trim(dbn) : dbn;

};

/**
 * populates the given directed graph object
 */
ATGC.DBN.prototype.populateGraph = function (g) {

  // iterate sequence/dbn, back link whenever a closing paranthesis is encounter.
  // Each vertex is given properties that store the index into the sequence,
  // the nucleotide and DBN character.

  var stack = [];
  var previous;

  for(var i = 0; i < this.sequence.length; i += 1) {

    var v = g.addVertex({
      index: i,
      nucleotide: this.sequence[i],
      dbn: this.dbn[i]
    });

    // there is always a directed edge from the previous vertex
    // to this one
    if (previous) {
      g.addEdge(v, previous, {
        type: ATGC.DBN.BACKBONE
      });
    }

    // open parenthesis: vertex => stack
    if (this.dbn[i] === '(') {
      stack.push(v);
    }

    // closing parenthesis: create link between vertex and current top of stack
    if (this.dbn[i] === ')') {
      var other = stack.pop();
      g.addEdge(v, other, {
        type: ATGC.DBN.NUCLEOTIDE
      });
    }

    previous = v;
  }

};

/**
 * validate the current sequence.
 * @return string error message or null if no error
 */
ATGC.DBN.prototype.validate = function () {

  // 1. sequences should not be empty.
  if (!this.sequence || !this.dbn) {
    return 'Empty sequence or DBN';
  }

  // 2. sequences should match in length
  if (this.sequence.length !== this.dbn.length) {
    return 'Sequence and DBN are not the same length';
  }

  // walk the sequence and the DBN, validate the characters and verify that the open/closing brackets are matched
  var stack = [];
  var i = 0;
  while (i < this.sequence.length) {

    if (ATGC.DBN.SCHARS.indexOf(this.sequence[i]) < 0) {
      return _.sprintf('Bad character (%s) in sequence at position %s', this.sequence[i], i);
    }

    if (ATGC.DBN.DCHARS.indexOf(this.dbn[i]) < 0) {
      return _.sprintf('Bad character (%s) in DBN at position %s', this.dbn[i], i);
    }

    // if an opening parenthesis then add this position to the stack
    if (this.dbn[i] === '(') {
      stack.push(i);
    }

    // if closing parenthesis then verify there is a matching item on the stack
    if (this.dbn[i] === ')') {
      if (stack.length === 0) {
        return _.sprintf('Bracket mismatch in DBN at position %s', i);
      }
      stack.pop();
    }

    i += 1;
  }

  // when we get to the end of the sequence the stack should be empty
  if (stack.length) {
    return 'Unexpected end of DBN ( unclosed brackets )';
  }

  return null;
};

/**
 * valid characters for sequence and DBN
 * @const {string}
 */
ATGC.DBN.SCHARS = 'AGCTUI';
ATGC.DBN.DCHARS = '.()';


/**
 * used to flag edges in any graph we construct. backbone is labeled
 * differently from nucleotide links
 * @type {string}
 */
ATGC.DBN.BACKBONE = 'Backbone';
ATGC.DBN.NUCLEOTIDE = 'Nucleotide';

/*
  e.g.
  CAGCACGACACUAGCAGUCAGUGUCAGACUGCAIACAGCACGACACUAGCAGUCAGUGUCAGACUGCAIACAGCACGACACUAGCAGUCAGUGUCAGACUGCAIA
  ..(((((...(((((...(((((...(((((.....)))))...))))).....(((((...(((((.....)))))...))))).....)))))...)))))..

  or
  AAGAAGAGGTAGCGAGTGGACGTGACTGCTCTATCCCGGGCAAAAGGGATAGAACCAGAGGTGGGGAGTCTGGGCAGTCGGCGACCCGCGAAGACTTGAGGTGCCGCAGCGGCATCCGGAGTAGCGCCGGGCTCCCTCCGGGGTGCAGCCGCCGTCGGGGGAAGGGCGCCACAGGCCGGGAAGACCTCCTCCCTTTGTGTCCAGTAGTGGGGTCCACCGGAGGGCGGCCCGTGGGCCGGGCCTCACCGCGGCGCTCCGGGACTGTGGGGTCAGGCTGCGTTGGGTGGACGCCCACCTCGCCAACCTTCGGAGGTCCCTGGGGGTCTTCGTGCGCCCCGGGGCTGCAGAGATCCAGGGGAGGCGCCTGTGAGGCCCGGACCTGCCCCGGGGCGAAGGGTATGTGGCGAGACAGAGCCCTGCACCCCTAATTCCCGGTGGAAAACTCCTGTTGCCGTTTCCCTCCACCGGCCTGGAGTCTCCCAGTCTTGTCCCGGCAGTGCCGCCCTCCCCACTAAGACCTAGGCGCAAAGGCTTGGCTCATGGTTGACAGCTCAGAGAGAGAAAGATCTGAGGGAAGATG
  ......((((..((...((.(((((((((((((((((........)))))))).(((((.........)))))))))))).)).))..))...))))........(((((....(((((.((.(((((....((((((.(.((((....)))).).))))))..))))).)).(((((.((((((((((((((...(((.((.((.(((((((((.((....)).((((....))))))))))))).)))))))...))))....(((((((((.((.((.((((((....)))))).)))).))).....)))))).)))))))))).)).)))))))))))))........((((((((.((((((...(((...((.(((((((...))..))))).)))))...)))).)))))...)))))..(((((..........((..(.(.(..((((.(((..(((((((...((.((...(((((((.....................)).)))))...)).))..))))).)).(((...........)))..))).)))))).).)))))))....

 */
