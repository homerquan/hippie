var paths = {
    src: 'server',
};

module.exports = function(grunt) {
    /*  Load tasks  */

    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            files: ['Gruntfile.js', 'server/*.js'],
            options: {
                globals: {
                    jQuery: true,
                    console: false,
                    module: true,
                    document: true
                }
            }
        },
        docco: {
            options: {
                dst: './docs',
                layout: 'parallel'
            },
            docs: {
                files: [{
                    expand: true,
                    cwd: './server',
                    src: [
                        '**/*.js'
                    ]
                }]
            }
        },
        shell: {
            publish: {
                command: 'npm publish'
            },
            version: {
                command: 'npm version patch'
            },
            commit: {
                command: 'git commit -a -m "release a new version"; git push'
            },
            'clear-doc': {
                command: 'rm -rf docs'
            },
            'supertest': {
                command: 'npm test'
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-npm-install');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-docco2');
    grunt.registerTask('refresh-deps', ['shell:npmUpdate']);
    grunt.registerTask('pre-test', ['jshint']);
    grunt.registerTask('unit-test', ['jshint']);
    grunt.registerTask('func-test', ['jshint']);
    grunt.registerTask('gen-doc', ['shell:clear-doc', 'docco']);
    grunt.registerTask('test', ['pre-test', 'unit-test', 'func-test']);
    grunt.registerTask('default', ['test', 'gen-doc']);
    grunt.registerTask('release', ['shell:version', 'shell:publish', 'shell:commit']);
};