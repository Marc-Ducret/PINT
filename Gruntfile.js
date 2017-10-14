module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        ts: {
            base: {
                src: ['src/ts/**/*.ts'],
                dest: 'build/js/',
                options: {
                    target: 'es6',
                    module: 'amd',
                    moduleResolution: 'node',
                    rootDir: 'src/ts/',
                    fast: 'always'
               //     lib: ['dom', 'es2015', 'es2015.iterable']
                }
            }
        },
        concat_dev: {
            css: {
                src: ["node_modules/materialize-css/dist/css/materialize.css",
                    "src/css/*.css"],
                dest: "build/main.css"
            }
        },
        concat: {
            css: {
                src: ["node_modules/materialize-css/dist/css/materialize.min.css",
                    "src/css/*.css"],
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
                src: ["build/main.js", "node_modules/jquery/dist/jquery.min.js", "node_modules/jasmine-jquery/lib/jasmine-jquery.js"],
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
    grunt.loadNpmTasks('grunt-ts');

    // Default task(s).
    grunt.registerTask('default', ['ts', 'concat_dev', 'htmlmin']);
    grunt.registerTask('release', ['concat', 'uglify', 'htmlmin', 'cssmin', 'inline', 'clean']);
    grunt.registerTask('doc',['jsdoc']);
    grunt.registerTask('test',['concat_dev', 'htmlmin', 'jasmine']);
}
