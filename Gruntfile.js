/*jshint camelcase: false*/

module.exports = function (grunt) {
  'use strict';

  // load all grunt tasks
  require('time-grunt')(grunt);
  require('load-grunt-tasks')(grunt);

  // configurable paths
  var config = {
    app       : 'mean-app',
    dist      : 'dist',
    tmp       : 'tmp',
    resources : 'resources'
  };

  grunt.initConfig({
    config     : config,
    clean      : {
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
    jshint     : {
      options : {
        jshintrc : '.jshintrc'
      },
      files   : ['Gruntfile.js','<%= config.app %>/Gruntfile.js']
    },
    nodewebkit : {
      options : {
        buildDir : '<%= config.dist %>',
        files : ['./<%= config.app %>/**/**']
      },
      mac     : {
        platforms : ['osx']
      },
      win     : {
        platforms : ['win']
      },
      linux   : {
        platforms : ['linux64']
      },
      linux32   : {
        platforms : ['linux32']
      }
    },
    hub        : {
      meanApp : {
        src : ['<%= config.app %>/Gruntfile.js']
      },
    }
  });

  grunt.registerTask('dist-linux', [
    'jshint',
    'clean:dist',
    'hub:meanApp:build',
    'nodewebkit:linux'
  ]);

  grunt.registerTask('dist-linux32', [
    'jshint',
    'clean:dist',
    'hub:meanApp:build',
    'nodewebkit:linux32'
  ]);

  grunt.registerTask('dist-win', [
    'jshint',
    'clean:dist',
    'hub:meanApp:build',
    'nodewebkit:win'
  ]);

  grunt.registerTask('dist-mac', [
    'jshint',
    'clean:dist',
    'hub:meanApp:build',
    'nodewebkit:mac'
  ]);

  grunt.registerTask('check', [
    'jshint',
    'hub:meanApp:lint'
  ]);

  // Default task(s).
  grunt.registerTask('default', ['check']);

};
