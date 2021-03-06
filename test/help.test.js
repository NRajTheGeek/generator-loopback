// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: generator-loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/* global describe, beforeEach, it */
'use strict';
var debug = require('debug')('test');
var fs = require('fs');
var path = require('path');
var assert = require('assert');
var helpers = require('yeoman-test');
var SANDBOX = path.resolve(__dirname, 'sandbox');
var yeomanEnv = require('yeoman-environment');

describe('loopback generator help', function() {
  this.timeout(300000); // 5 minutes

  beforeEach(function createSandbox(done) {
    helpers.testDirectory(SANDBOX, done);
  });

  it('prints help message with yo by default', function() {
    var names = ['app', 'acl', 'datasource', 'model', 'property', 'relation',
      'bluemix'];
    names.forEach(function(name) {
      var gen = givenGenerator(name);
      var helpText = gen.help();
      assert(helpText.indexOf(' yo ') !== -1);
      assert(helpText.indexOf(' slc ') === -1);
    });
  });

  it('prints help message with slc if invoked from slc', function() {
    process.env.SLC_COMMAND = 'loopback --help';
    var names = ['app', 'acl', 'datasource', 'model', 'property', 'relation',
      'bluemix'];
    try {
      names.forEach(function(name) {
        var gen = givenGenerator(name, ['--help']);
        var helpText = gen.help();
        assert(helpText.indexOf(' slc ') !== -1);
        assert(helpText.indexOf(' yo ') === -1);
      });
    } catch (err) {
      process.env.SLC_COMMAND = undefined;
      throw err;
    }
    process.env.SLC_COMMAND = undefined;
  });

  it('prints help message with lb if invoked from loopback-cli', function() {
    process.env.SLC_COMMAND = 'loopback-cli';
    var gen = givenGenerator('app');
    var helpText = gen.help();
    debug('--HELP TEXT--\n', helpText);
    assert(helpText.indexOf(' lb ') !== -1,
      '"lb" should be used');
    assert(helpText.indexOf('Available commands') !== -1,
      '"Available commands" should be used');

    assert(helpText.indexOf(' slc ') === -1,
      '"slc" should not be present');
    assert(helpText.indexOf(' yo ') === -1,
      '"yo" should not be present');
    assert(helpText.indexOf('Available generators') === -1,
      '"Available generators" should not be present');
  });

  describe('prints right help message for each generator', function() {
    var CMD_NAMES = ['acl', 'app', 'boot-script', 'datasource',
      'export-api-def', 'middleware', 'model', 'property', 'relation',
      'remote-method', 'swagger', 'bluemix'];

    CMD_NAMES.forEach(function(name) {
      it('prints right help message for generator ' + name, function() {
        process.env.SLC_COMMAND = 'slc';
        var gen = givenGenerator(name);
        var helpText = gen.help();
        var helpFileName = 'loopback_' + name + '_help.txt';
        var helpFilePath = '../fixtures/help-texts/' + helpFileName;
        var output = fs.readFileSync(helpFilePath, 'utf8');
        assert.equal(helpText, output);
      });
    });

    afterEach(function resetSLCCommand() {
      process.env.SLC_COMMAND = undefined;
    });
  });

  function givenGenerator(name) {
    var genPath = path.join(__dirname, '../', name);
    var genClass = require(genPath);
    var gen = new genClass({
      env: yeomanEnv.createEnv(),
      resolved: genPath,
      // manually set the namespace here since in a real
      // use case, it's set by loopback-cli
      namespace: 'loopback:' + name,
    });
    return gen;
  }
});
