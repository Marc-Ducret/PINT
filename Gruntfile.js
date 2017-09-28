module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        concat_dev: {
            js: {
                src: ["node_modules/jquery/dist/jquery.js",
                    "node_modules/materialize-css/dist/js/materialize.js",
                    "src/js/PINT.js",
                    "src/js/ui.js"],
                dest: "build/main.js"
            },
            css: {
                src: ["node_modules/materialize-css/dist/css/materialize.css",
                    "src/css/main.css"],
                dest: "build/main.css"
            }
        },
        concat: {
            js: {
                src: ["node_modules/jquery/dist/jquery.min.js",
                    "node_modules/materialize-css/dist/js/materialize.min.js",
                    "src/js/PINT.js"],
                dest: "build/main.js"
            },
            css: {
                src: ["node_modules/materialize-css/dist/css/materialize.min.css",
                    "src/css/main.css"],
                dest: "build/main.css"
            }
        },
        uglify:{
            main: {
                src: "build/main.js",
                dest: "build/main.js"
            }
        },
        htmlmin: {
            main: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true
                },
                files: {
                    "build/index.html": ["src/index.html"]
                }
            }
        },
        cssmin: {
            main: {
                src: "build/main.css",
                dest: "build/main.css"
            }
        },
        jasmine: {
            main: {
                src: ["build/main.js", "node_modules/jasmine-jquery/lib/jasmine-jquery.js"],
                options: {
                    specs: "test/*.js"
                }
            }
        },
        inline: {
            main: {
                src: "build/index.html",
                dest: "build/index.html"
            }
        },
        clean: {
            main: ["build/*.css", "build/*.js"]
        },
        jsdoc : {
            dist : {
                src: ['src/js/*.js', 'README.md'],
                options: {
                    destination : 'doc',
                    template : "node_modules/ink-docstrap/template",
                    configure : "node_modules/ink-docstrap/template/jsdoc.conf.json"
                }
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.renameTask('concat','concat_dev');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-inline');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-jsdoc');

    // Default task(s).
    grunt.registerTask('default', ['concat_dev', 'htmlmin']);
    grunt.registerTask('release', ['concat', 'uglify', 'htmlmin', 'cssmin', 'inline', 'clean']);
    grunt.registerTask('doc',['jsdoc']);
    grunt.registerTask('test',['concat_dev', 'jasmine']);
}
