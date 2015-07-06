/*jshint camelcase: false*/

module.exports = function (grunt) {
  'use strict';

  // load all grunt tasks
  require('time-grunt')(grunt);
  require('load-grunt-tasks')(grunt);

  // load custom grunt task for npm install
  require('./tasks/grunt-npm-install')(grunt);

  // load custom grunt task that runs the gulp task to build releases
  require('./tasks/grunt-gulp-release')(grunt);

  // configurable paths
  var config = {
    app       : 'mean-app',
    build     : 'build',
    dist      : 'releases',
    resources : 'resources'
  };

  grunt.initConfig({
    config         : config,
    clean          : {
      dist : {
        files : [
          {
            dot : true,
            src : [
              '<%= config.dist %>/*',
              '<%= config.build %>/*'
            ]
          }
        ]
      }
    },
    jshint         : {
      options : {
        jshintrc : '.jshintrc'
      },
      files   : ['Gruntfile.js', '<%= config.app %>/Gruntfile.js', 'tasks/**/*.js']
    },
    bump           : {
      options : {
        files              : ['package.json', 'mean-app/package.json'],
        commit             : false,
        createTag          : false,
        push               : false
      }
    },
    copy           : {
      app : {
        files : [
          {
            expand : true,
            dot    : true,
            src    : ['<%= config.app %>/**', '!<%= config.app %>/node_modules/**', '!<%= config.app %>/public/lib/*/**'],
            dest   : '<%= config.build %>/'
          }
        ]
      }
    },
    hub            : {
      meanApp : {
        src : ['<%= config.app %>/gruntfile.js']
      }
    },
    'npm-install'  : {
      'dist' : {
        'options' : {
          'args' : '--production',
          'cwd'  : '<%= config.build %>/<%= config.app %>'
        }
      }
    },
    'gulp-release' : {
      'dist' : {
        'options' : {
          'args' : '--env=production'
        }
      }
    }
  });

  grunt.registerTask('build', [
    'check',
    'bump',
    'clean:dist',
    'hub:meanApp:build',
    'copy',
    'npm-install',
    'gulp-release'
  ]);

  grunt.registerTask('check', [
    'jshint',
    'hub:meanApp:lint'
  ]);

  // Default task(s).
  grunt.registerTask('default', ['check']);

};
