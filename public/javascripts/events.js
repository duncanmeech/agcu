
/**
 * a singleton class for subscribing to messages
 */
var Events = function () {

  // hash to listeners for a specific event
  this.hash = {};

};

/**
 * singleton accessor for Events instances
 * @return {Events}
 */
Events.I = function() {
  if (!Events._I) {
    Events._I = new Events();
  }
  return Events._I;
};

/**
 * subscribe to an named event with the given callback. The listening object
 * is optional but can be used to unsubscribe all events for the given object if provided.
 * @param  {[type]} event  [description]
 * @param  {[type]} method [description]
 * @return {[type]}        [description]
 */
Events.prototype.subscribe = function(event, method, obj) {

  U.ASSERT(_.isString(event) && _.isFunction(method), "Bad parameters");

  // ensure we have a list of listeners for this event
  this.hash[event] = this.hash[event] || [];

  // get a UUID for the listener
  var _uuid = uuid.v4();

  // add to list of listeners
  this.hash[event].push({
    uuid: _uuid,
    method: method,
    obj: obj
  });

  // return the UUID so the caller can remove the listener
  return _uuid;
};

/**
 * unsubscribe a listener based on issued uuid
 * @param  {[type]} uuid [description]
 */
Events.prototype.unsubscribe = function(uuid) {

  _.each(this.hash, function(list) {
    for(var i = 0; i < list.length; i += 1) {
      if (list[i].uuid === uuid) {
        list.splice(i, 1);
        return;
      }
    }
  });
  U.ASSERT(false, "Unsubscribe with invalid uuid");
};

/**
 * unsubscribe all events for the given object
 * @param  {Object} object [description]\
 */
Events.prototype.unsubscribeObject = function(obj) {

  _.each(this.hash, function(list) {
    var i = 0;
    while (i < list.length) {
      if (list[i].obj === obj) {
        list.splice(i, 1);
      } else {
        i += 1;
      }
    }
  });

};

/**
 * call all listeners to the given event. All arguments are passed to the listeners
 * @param  {String} event
 */
Events.prototype.publish = function(event) {

  var args = _.toArray(arguments);
  if (this.hash[event]) {
    this.hash[event].forEach(function(record) {
        record.method.apply(this, args);
    });
  }
};

// user grabbed a vertex to move
Events.VERTEX_PICKED = 'vertex-picked';
