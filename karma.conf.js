module.exports = function(config) {
    config.set({
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
        singleRun: true
    });
};
