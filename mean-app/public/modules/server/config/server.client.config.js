'use strict';

// Configuring the server module
angular.module('server').run(['Menus',
  function (Menus) {
    // Set top bar menu item
    Menus.addMenuItem('topbar', 'Server', 'server');
  }
]);
