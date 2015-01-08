'use strict';

// Configuring the folders module
angular.module('folders').run(['Menus',
  function (Menus) {
    // Set top bar menu item
    Menus.addMenuItem('topbar', 'Library', 'folders');
  }
]);
