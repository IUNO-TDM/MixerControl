

module.exports = function(grunt) {

  // Project configuration.
  	grunt.initConfig({
  		copy: {
  			main: {
    			files: [
      			// includes files within path and its sub-directories
      			{expand: true, cwd: 'node_modules/', src: ['@angular/**'], dest: 'public/scripts/'},
      			{expand: true, cwd: 'node_modules/', src: ['angular-in-memory-web-api/**'], dest: 'public/scripts/'},
      			{expand: true, cwd: 'node_modules/', src: ['rxjs/**'], dest: 'public/scripts/'},
      			{expand: true, cwd: 'node_modules/', src: ['systemjs/**'], dest: 'public/scripts/'},
      			{expand: true, cwd: 'node_modules/', src: ['zone.js/**'], dest: 'public/scripts/'},
      			{expand: true, cwd: 'node_modules/', src: ['core-js/**'], dest: 'public/scripts/'},
      			{expand: true, cwd: 'node_modules/', src: ['qrcode-js/**'], dest: 'public/scripts/'},
      			{expand: true, cwd: 'node_modules/', src: ['socket.io/**'], dest: 'public/scripts/'},
      			{expand: true, cwd: 'node_modules/', src: ['socket.io-client/**'], dest: 'public/scripts/'},
      			{expand: true, cwd: 'node_modules/', src: ['socket.io-parser/**'], dest: 'public/scripts/'},
      			{expand: true, cwd: 'node_modules/', src: ['socket.io-adapter/**'], dest: 'public/scripts/'},
    			],
  			},
		},
	});

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-copy');

  // Default task(s).
  grunt.registerTask('default', ['copy']);

};
