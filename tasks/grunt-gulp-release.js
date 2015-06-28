'use strict';

module.exports = function (grunt) {
  var exec = require('child_process').exec;
  var path = require('path');

  grunt.registerMultiTask('gulp-release', 'Runs the gulp task for building releases', function () {
    var done = this.async();

    var options = this.options({
      args        : '',
      cwd         : process.cwd(),
      stdout      : true,
      stderr      : true,
      failOnError : true
    });

    var cwd = path.resolve(process.cwd(), options.cwd);

    grunt.log.writeln('Running gulp release');
    var cmd = exec('gulp release --color' + options.args, {cwd : cwd}, function (error) {
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
  });
};
