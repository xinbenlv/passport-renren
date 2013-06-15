var vows = require('vows');
var assert = require('assert');
var util = require('util');
var renren = require('passport-renren');


vows.describe('passport-renren').addBatch({
  
  'module': {
    'should report a version': function (x) {
      assert.isString(renren.version);
    },
  },
  
}).export(module);
