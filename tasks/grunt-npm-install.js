'use strict';

module.exports = function (grunt) {
  var exec = require('child_process').exec;
  var path = require('path');

  grunt.registerMultiTask('npm-install', 'Runs npm install to install npm dependencies', function () {

    var done = this.async();

    var options = this.options({
      args        : '',
      cwd         : process.cwd(),
      stdout      : true,
      stderr      : true,
      failOnError : true
    });

    var cwd = path.resolve(process.cwd(), options.cwd);

    var file = path.join(cwd, 'package.json');

    if (grunt.file.exists(file)) {
      grunt.log.writeln('Running npm install on %s...', file);
      var cmd = exec('npm install ' + options.args, {cwd : cwd}, function (error) {
        if (error && options.failOnError) {
          grunt.warn(error);
          done();
        }
        grunt.log.writeln('done.');
        done();
      });

      if (options.stdout || grunt.option('verbose')) {
        cmd.stdout.pipe(process.stdout);
      }
      if (options.stderr || grunt.option('verbose')) {
        cmd.stderr.pipe(process.stderr);
      }
    }

  });
};
