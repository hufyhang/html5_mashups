module.exports = function (grunt) {
  'use strict';

  require('time-grunt')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    concat: {
      js: {
        src: ['js/main_events.js', 'js/market.js', 'js/big_canvas_events.js', 'js/jsonFetcher.js', 'js/md5.js', 'js/servicesComposer.js', 'js/widget.js', 'js/workers.js'],
        dest: 'dist/js/script.js'
      }
    },

    uglify: {
      js: {
        files: [{
          expand: true,
          cwd: 'dist/js/',
          src: '*.js',
          dest: 'dist/js/'
        }]
      }
    },

    copy: {
      main: {
        files: [
          // js files
          {expand: true, src: ['js/jquery.js'], dest: 'dist/'},
          {expand: true, src: ['js/kinetic-v4.4.0.min.js'], dest: 'dist/'},
          {expand: true, src: ['js/jsontree.min.js'], dest: 'dist/'},
          {expand: true, src: ['js/ixDbEz.js'], dest: 'dist/'},

          // css
          {expand: true, src: ['css/jsontree.css'], dest: 'dist/'},
          {expand: true, src: ['css/master.css'], dest: 'dist/'},

          // index.html
          {expand: true, src: ['index.html'], dest: 'dist/'},

          // img
          {expand: true, src: ['img/*'], dest: 'dist/'},

          // php
          {expand: true, src: ['php/*'], dest: 'dist/'},
        ]
      }
    },

    htmlmin: {
      dist: {
        options: {
          removeComments: true,
          collapseWhitespace: true
        },
        files: {
          'dist/index.html': 'index.html'
        }
      }
    },

    cssmin: {
      dist: {
        expand: true,
        cwd: 'dist/css/',
        src: ['*.css'],
        dest: 'dist/css/'
      }
    },

    ftp_push: {
      build: {
        options: {
          host: 'feifeihang.info',
          port: 21,
          authKey: 'key',
          dest: '/public_html/hypermash/'
        },
        files: [{
          expand: true,
          cwd: '.',
          src: [
            'dist/**'
          ]
        }]
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-ftp-deploy');
  grunt.registerTask('build', ['concat', 'copy', 'uglify', 'htmlmin', 'cssmin']);
  grunt.registerTask('deploy', ['ftp_push:build']);

};
