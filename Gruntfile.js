module.exports = function(grunt) {
    grunt.initConfig({
        uglify: {
          options: {
            banner: '/*! PINT <%= grunt.template.today("yyyy-mm-dd") %> */\n'
          },
          build: {
            src: 'src/PINT.js',
            dest: 'build/PINT.min.js'
          }
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // Default task(s).
    grunt.registerTask('default', ['uglify']);
}
