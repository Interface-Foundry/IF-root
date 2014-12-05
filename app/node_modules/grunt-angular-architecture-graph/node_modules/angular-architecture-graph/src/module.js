"use strict";

var _ = require("lodash");

var pluralize = require("pluralize");
var utils = require("./utils");
var api   = require("./api");

function Module(name, deps, options) {
  this.name = name;
  this.items = [];
  this.controllers = [];
  this.services = [];
  this.factories = [];
  this.filters = [];
  this.providers = [];
  this.directives = [];

  this.options = options;

  if (this.options.hideAngularServices) {
    deps = _.filter(deps, function (dep) {
      return !_.contains(api.angularServices, dep);
    });
  }
  this.modules = deps;
}

// Adds module methods
api.methods.forEach(function(method) {
  Module.prototype[ method ] = function addItem(name) {
    if (!name) {
      return this;
    }
    this.items.push(name);
    return this;
  };
});

["controller", "factory", "service", "filter", "provider", "directive"].forEach(function (method) {
  Module.prototype[ method ] = function (name, deps) {
    if (!name) {
      return this;
    }
    deps = utils.parseAngularDeps(deps).deps;

    // Exclude angular services from dependencies
    if (this.options.hideAngularServices) {
      deps = _.filter(deps, function (dep) {
        return !_.contains(api.angularServices, dep);
      });
    }
    this[pluralize(method)].push({
      "name": name,
      "deps": deps
    });
    this.items.push(name);
    return this;
  };
});

Module.prototype.run = function() {
  return this;
};

Module.prototype.config = function() {
  return this;
};

module.exports = Module;
