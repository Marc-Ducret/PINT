module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        /**
         * Typescript compilation.
         */
        ts: {
            server: {
                src: ['src/**/**.ts'],
                dest: 'build/',
                options: {
                    target: 'es6',
                    module: 'amd',
                    moduleResolution: 'node',
                    rootDir: 'src/',
                    fast: 'always'
                }
            },
            client_standalone: {
                src: ['src/client/*.ts'],
                dest: 'build/',
                options: {
                    target: 'es6',
                    module: 'amd',
                    moduleResolution: 'node',
                    rootDir: 'src/',
                    fast: 'always'
                }
            },
            convnet: {
                src: ['src/client/ts/lib/convnet/*.ts'],
                dest: 'build/client/convnetjs-ts.js',
                options: {
                    target: 'es6',
                    module: 'amd',
                    moduleResolution: 'node',
                    rootDir: 'node_modules/convnetjs-ts/src/'
                }
            }
        },
        /**
         * File concatenation.
         */
        concat: {
            css_dev: {
                src: ["node_modules/materialize-css/dist/css/materialize.css",
                    "src/client/css/*.css"],
                dest: "build/client/main.css"
            },
            css: {
                src: ["node_modules/materialize-css/dist/css/materialize.min.css",
                    "src/client/css/*.css"],
                dest: "build/client/main.css"
            },
            js_server_header: {
                src: ["src/server/header.js", "build/server/index.js"],
                dest: "build/server/main.js"
            }
        },
        /**
         * Minify HTML
         */
        htmlmin: {
            main: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true
                },
                files: {
                    "build/client/index.html": ["src/client/index.html"]
                }
            }
        },
        /**
         * Minify CSS
         */
        cssmin: {
            main: {
                src: "build/client/main.css",
                dest: "build/client/main.css"
            }
        },
        /**
         * Copy image content and libraries.
         */
        copy: {
            jquery_dev: {
                src: 'node_modules/jquery/dist/jquery.js',
                dest: 'build/client/jquery.js',
            },
            jquery_release: {
                src: 'node_modules/jquery/dist/jquery.min.js',
                dest: 'build/client/jquery.js',
            },
            requirejs: {
                src: 'node_modules/requirejs/require.js',
                dest: 'build/client/require.js',
            },
            img: {
                expand: true,
                cwd: 'src/client/assets/',
                src: '*',
                dest: 'build/client/assets/'
            },
            mat: {
                src: 'src/client/mat.js',
                dest: 'build/client/mat.js',
            },
            materialize: {
                expand: true,
                cwd: 'node_modules/materialize-css/js',
                src: '*',
                dest: 'build/client/materialize/',
            },
            html: {
                src: 'src/client/index.html',
                dest: 'build/client/index.html',
            },
            electron: {
                src: 'src/desktopapp/main.js',
                dest: 'build/client/index.js',
            },
            electron_package: {
                src: 'package.json',
                dest: 'build/client/',
            }
        },
        /**
         * Minify in one single file.
         */
        requirejs: {
            release: {
                options: {
                    baseUrl: 'build/js',
                    name: 'main',
                    out: 'build/client/main.js',
                    optimize: 'uglify2',
                    generateSourceMaps: false,
                    preserveLicenseComments: false,
                    useSourceUrl: false
                }
            }
        },
        /**
         * Documentation generator.
         */
        exec: {
            make_doc: {
                command: 'node_modules/typedoc/bin/typedoc --mode file --module amd --out doc/ src/ts/'
            },
            electron_package: {
                command: 'electron-packager build/client/ --electron-version=1.7.10'
            }
        },
        /**
         * Test framework.
         */
        jasmine: {
            main: {
                src: ["build/client/main.js", "node_modules/jquery/dist/jquery.min.js", "node_modules/jasmine-jquery/lib/jasmine-jquery.js"],
                options: {
                    specs: "test/*.js"
                }
            }
        },
        /**
         * Clean build.
         */
        clean: {
            main: ["build/**/*", ".tscache"]
        },
        cleanempty: {
            options: {
                folders: true
            },
            src: ['build/**']
        },
        touch: {
            fake_socketio: 'build/client/socket.io/socket.io.js.js'
        },
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
    grunt.loadNpmTasks('grunt-touch');

    grunt.registerTask('server', [
        'ts:server',
        'ts:convnet',
        'copy:materialize',
        'copy:mat',
        'copy:img',
        'copy:jquery_dev',
        'copy:requirejs',
        'concat:css_dev',
        'concat:js_server_header',
        'copy:html']);

    grunt.registerTask('standalone-client', [
        'ts:client_standalone',
        'ts:convnet',
        'copy:materialize',
        'copy:mat',
        'copy:img',
        'copy:jquery_dev',
        'copy:requirejs',
        'concat:css_dev',
        'copy:html',
        'copy:electron',
        'copy:electron_package',
        'touch:fake_socketio',
        'exec:eletron_package']);


    // Default task: dev build of the server with source maps
    grunt.registerTask('default', [
        'ts:server',
        'ts:convnet',
        'copy:materialize',
        'copy:mat',
        'copy:img',
        'copy:jquery_dev',
        'copy:requirejs',
        'concat:css_dev',
        'concat:js_server_header',
        'copy:html']);

    // Generate documentation.
    grunt.registerTask('doc',['exec:make_doc']);
    // Tests executed with npm test
};
