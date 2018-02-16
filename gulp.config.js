module.exports = function() {
    var client = 'client',
        clientApp = './client/app',
        core = 'core',
        dist = 'dist',
        tmp = '.tmp',
        docs = 'documentation',
        landing = 'landing';
    var config = {
        client: client,
        core: core,
        dist: dist,
        tmp: tmp,
        index: client + "/index.html",
        alljs: [
            client + "/app/**/*.js",
            './*.js'
        ],
        assets: [
            client + "/app/**/*.html",
            client + "/bower_components/font-awesome/css/*",
            client + "/bower_components/font-awesome/fonts/*",
            client + "/bower_components/weather-icons/css/*",
            client + "/bower_components/weather-icons/font/*",
            client + "/bower_components/weather-icons/fonts/*",
            client + "/bower_components/material-design-iconic-font/dist/**/*",
            client + "/fonts/**/*",
            client + "/i18n/**/*",
            client + "/images/**/*",
            client + "/styles/loader.css",
            client + "/styles/ui/images/*",
            client + "/favicon.ico",
            core + "/views/**/*",
            core + "/public/**/*"
        ],
        less: [],
        sass: [
            client + "/styles/**/*.scss"
        ],
        js: [
            clientApp + "/**/*.module.js",
            clientApp + "/**/*.js",
            '!' + clientApp + "/**/*.spec.js"
        ],
        docs: docs,
        allToClean: [
            tmp,
            ".DS_Store",
            ".sass-cache",
            "node_modules",
            ".git",
            "readme.md"
        ]
    };

    return config;
};
