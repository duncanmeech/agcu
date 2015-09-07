var X = X || {};

/**
 * load a graph by ID
 * @param  {string} id             [description]
 * @param  {function} successHandler [description]
 * @param  {function} errorHandler   [description]
 */
X.Load = function(id, callback) {

  var xhr = new XMLHttpRequest();
  xhr.open('get', _.sprintf('/api/load/%s', id), true);

  xhr.onreadystatechange = function() {

    if (xhr.readyState == 4) {
      var status = xhr.status;
      if (status == 200) {
        var obj = JSON.parse(xhr.responseText);
        var vertices = JSON.parse(obj.vertices);
        callback(obj.error, obj.sequence, obj.dbn, vertices);
      } else {
        callback(K.API_UNKNOWN_ERROR);
      }
    }
  };
  xhr.send();
};

/**
 * save the given DBN sequence
 * @param  {[type]} dbn            [description]
 * @param  {Function} callback

 */
X.Create = function(dbn, vertices, callback) {

  var xhr = new XMLHttpRequest();
  xhr.open('get', _.sprintf('/api/create/%s/%s/%s', dbn.sequence, dbn.dbn, vertices), true);

  xhr.onreadystatechange = function() {

    if (xhr.readyState == 4) {
      var status = xhr.status;
      if (status == 200) {
        var data = JSON.parse(xhr.responseText);
        callback(data.error, data.id);
      } else {
        callback(K.API_ERROR_UNKNOWN);
      }
    }
  }
  xhr.send();

};

/**
 * load a graph by ID
 * @param  {string} id             [description]
 * @param  {function} successHandler [description]
 * @param  {function} errorHandler   [description]
 */
X.Save = function(id, sequence, dbn, vertices, callback) {

  var xhr = new XMLHttpRequest();
  xhr.open('get', _.sprintf('/api/save/%s/%s/%s/%s', id, sequence, dbn, vertices), true);

  xhr.onreadystatechange = function() {

    if (xhr.readyState == 4) {
      var status = xhr.status;
      if (status == 200) {
        var obj = JSON.parse(xhr.responseText);
        callback(obj.error);
      } else {
        callback(K.API_UNKNOWN_ERROR);
      }
    }
  };
  xhr.send();
};
