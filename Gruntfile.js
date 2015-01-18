/*jshint camelcase: false*/

module.exports = function (grunt) {
  'use strict';

  // load all grunt tasks
  require('time-grunt')(grunt);
  require('load-grunt-tasks')(grunt);

  // load custom grunt task for npm install
  require('./grunt-npm-install')(grunt);

  // configurable paths
  var config = {
    app       : 'mean-app',
    dist      : 'dist',
    tmp       : 'tmp',
    resources : 'resources'
  };

  grunt.initConfig({
    config        : config,
    clean         : {
      dist : {
        files : [
          {
            dot : true,
            src : [
              '<%= config.dist %>/*',
              '<%= config.tmp %>/*'
            ]
          }
        ]
      }
    },
    jshint        : {
      options : {
        jshintrc : '.jshintrc'
      },
      files   : ['Gruntfile.js', '<%= config.app %>/Gruntfile.js']
    },
    copy          : {
      app : {
        files : [
          {
            expand : true,
            dot    : true,
            src    : ['<%= config.app %>/**', '!<%= config.app %>/node_modules/**', '!<%= config.app %>/public/lib/*/**'],
            dest   : '<%= config.tmp %>/'
          }
        ]
      }
    },
    'npm-install' : {
      'dist' : {
        'options' : {
          'args' : '--production',
          'cwd'  : '<%= config.tmp %>/<%= config.app %>'
        }
      }
    },
    nodewebkit    : {
      options : {
        buildDir  : '<%= config.dist %>',
        platforms : ['osx64', 'win64']
      },
      src     : ['<%= config.tmp %>/<%= config.app %>/**/*']
    },
    hub           : {
      meanApp : {
        src : ['<%= config.app %>/gruntfile.js']
      }
    }
  });

  grunt.registerTask('build', [
    'check',
    'clean:dist',
    'hub:meanApp:build',
    'copy:app',
    'npm-install',
    'nodewebkit'
  ]);

  grunt.registerTask('check', [
    'jshint',
    'hub:meanApp:lint'
  ]);

  // Default task(s).
  grunt.registerTask('default', ['check']);

};
