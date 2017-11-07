module.exports = function(config) {
    var configuration = {
        basePath: '.',
        frameworks: ["jasmine", "karma-typescript"],
        files: [
            { pattern: "src/ts/**/*.ts" },
            { pattern: "test/**/*.ts" }
        ],
        preprocessors: {
            "src/**/*.ts": ["karma-typescript", "coverage"],
            "test/**/*.ts": ["karma-typescript"],
        },
        reporters: ["progress", 'coverage', "karma-typescript"],
        browsers: ["Chrome"],
        singleRun: true,
        customLaunchers: {
            Chrome_travis_ci: {
                base: 'Chrome',
                flags: ['--no-sandbox']
            }
        },
    };

    if (process.env.TRAVIS) {
        configuration.browsers = ['Chrome_travis_ci'];
    }

    config.set(configuration);
};
