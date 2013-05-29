var flow = require('flow');
/*
 * @name dbsync
**/
exports = module.exports = createModule;

exports.prop = 'val';

function createModule() {
  return function __dbsync(){
    console.log(' + dbsync(); flow', flow);
  }
}
