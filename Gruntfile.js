module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        ts: {
            dev: {
                src: ['src/client/ts/**/*.ts', 'src/client/main.ts'],
                dest: 'build/html/',
                options: {
                    target: 'es6',
                    module: 'amd',
                    moduleResolution: 'node',
                    rootDir: 'src/client/',
                    fast: 'always'
                }
            },
            server: {
                src: ['src/server/*.ts'],
                dest: 'build/',
                options: {
                    target: 'es6',
                    module: 'commonjs',
                    moduleResolution: 'node',
                    rootDir: 'src/server/',
                    fast: 'always'
                }
            },
            release: {
                src: ['src/client/ts/**/*.ts', 'src/client/main.ts'],
                dest: 'build/html/main.js',
                options: {
                    target: 'es6',
                    module: 'amd',
                    moduleResolution: 'node',
                    rootDir: 'src/client/'
                }
            },
            convnet: {
                src: ['node_modules/convnetjs-ts/src/*.ts'],
                dest: 'build/convnetjs-ts.js',
                options: {
                    target: 'es6',
                    module: 'amd',
                    moduleResolution: 'node',
                    rootDir: 'node_modules/convnetjs-ts/src/'
                }
            },
        },
        concat: {
            css_dev: {
                src: ["node_modules/materialize-css/dist/css/materialize.css",
                    "src/client/css/*.css"],
                dest: "build/html/main.css"
            },
            css: {
                src: ["node_modules/materialize-css/dist/css/materialize.min.css",
                    "src/client/css/*.css"],
                dest: "build/html/main.css"
            }
        },
        htmlmin: {
            main: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true
                },
                files: {
                    "build/html/index.html": ["src/client/index.html"]
                }
            }
        },
        cssmin: {
            main: {
                src: "build/html/main.css",
                dest: "build/html/main.css"
            }
        },
        jasmine: {
            main: {
                src: ["build/html/main.js", "node_modules/jquery/dist/jquery.min.js", "node_modules/jasmine-jquery/lib/jasmine-jquery.js"],
                options: {
                    specs: "test/*.js"
                }
            }
        },
        clean: {
            main: ["build/**/*", ".tscache"]
        },
        cleanempty: {
            options: {
                folders: true
            },
            src: ['build/**']
        },
        jsdoc : {
            dist : {
                src: ['src/client/ts/*.ts', 'README.md'],
                options: {
                    destination : 'doc',
                    template : "node_modules/ink-docstrap/template",
                    configure : "node_modules/ink-docstrap/template/jsdoc.conf.json"
                }
            }
        },
        copy: {
            jquery_dev: {
                src: 'node_modules/jquery/dist/jquery.js',
                dest: 'build/html/jquery.js',
            },
            jquery_release: {
                src: 'node_modules/jquery/dist/jquery.min.js',
                dest: 'build/html/jquery.js',
            },
            requirejs: {
                src: 'node_modules/requirejs/require.js',
                dest: 'build/html/require.js',
            },
            img: {
                expand: true,
                cwd: 'src/client/assets/',
                src: '*',
                dest: 'build/html/assets/'
            }
        },
        requirejs: {
            release: {
                options: {
                    baseUrl: 'build/js',
                    name: 'main',
                    out: 'build/html/main.js',
                    optimize: 'uglify2',
                    generateSourceMaps: true,
                    preserveLicenseComments: false,
                    useSourceUrl: true
                }
            }
        },
        exec: {
            make_doc: {
                command: 'node_modules/typedoc/bin/typedoc --mode file --module amd --out doc/ src/ts/'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-cleanempty');
    grunt.loadNpmTasks('grunt-ts');
    grunt.loadNpmTasks('grunt-exec');

    // Default task: dev build with source maps
    grunt.registerTask('default', ['ts:server', 'ts:dev', 'copy:img', 'copy:jquery_dev', 'copy:requirejs', 'concat:css_dev', 'htmlmin']);
    // Release task: compress js, html, css, remove source maps.
    grunt.registerTask('release', ['ts:server', 'ts:release', 'copy:img', 'copy:jquery_release', 'copy:requirejs', 'concat:css', 'htmlmin', 'cssmin', 'clean', 'cleanempty']);
    // Generate documentation.
    grunt.registerTask('doc',['exec:make_doc']);
    // Tests executed with npm test
}
