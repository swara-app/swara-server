'use strict';

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function () {
  // Init module configuration options
  var applicationModuleName = 'swara-server';
  var applicationModuleVendorDependencies = [
    'ngResource', 'ngCookies', 'ngAnimate', 'ngTouch', 'ngSanitize', 'ui.router', 'ui.bootstrap', 'ui.utils',
    'cgPrompt', 'angularUtils.directives.dirPagination', 'ncy-angular-breadcrumb', 'luegg.directives',
    'btford.socket-io', 'cgBusy'
  ];

  // Add a new vertical module
  var registerModule = function (moduleName, dependencies) {
    // Create angular module
    angular.module(moduleName, dependencies || []);

    // Add the module to the AngularJS configuration file
    angular.module(applicationModuleName).requires.push(moduleName);
  };

  return {
    applicationModuleName               : applicationModuleName,
    applicationModuleVendorDependencies : applicationModuleVendorDependencies,
    registerModule                      : registerModule
  };
})();
