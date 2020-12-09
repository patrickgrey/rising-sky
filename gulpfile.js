"use strict";

const gulp = require("gulp");
const { series, src, dest, watch } = require("gulp");
const fs = require("fs");
const path = require("path");
const browserSync = require("browser-sync");
// const babel = require("gulp-babel");
const del = require("del");
const size = require("gulp-size");
const imagemin = require("gulp-imagemin");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const sass = require("gulp-sass");
const tailwindcss = require('tailwindcss');
const purgecss = require('@fullhuman/postcss-purgecss');
// const csso = require('postcss-csso');
const cssnano = require('cssnano'); 
const dependents = require('gulp-dependents');
const rename = require("gulp-rename");
const zip = require("gulp-zip");
const wait = require("gulp-wait");
const rollup = require("gulp-better-rollup");
const rollupBabel = require("rollup-plugin-babel");
const resolve = require("rollup-plugin-node-resolve");
const commonjs = require("rollup-plugin-commonjs");

const source = "app";
const publish = "dist";
const CLIX = "clix";
const MOOC = "MOOCDirectAccess";
const currentCoreCSS = "ians-core-3.css";
const folderIgnoreArray = [CLIX, MOOC];

let server = null;

// https://nshki.com/es6-in-gulp-projects/

const ignoreList = [

];

const imageFormats = `/**/*.{jpg,jpeg,svg,png,gif}`;

const formats = [
  `${source}/**/*.html`,
  `${source}/**/*.js`,
  `${source}/**/*.css`,
  `${source}${imageFormats}`
];

///////////////////////////////
// UTILITIES
///////////////////////////////

function clean() {
  return del([".tmp", `${publish}`]);
}

function getFolders(dir) {
  return fs.readdirSync(dir).filter(function(file) {
    return fs.statSync(path.join(dir, file)).isDirectory();
  });
}

const foldersDirty = getFolders(source);
const folders = foldersDirty.filter(function(item) {
  // Filter our ignore folders like CLIX.
  return !folderIgnoreArray.includes(item);
});

function getSubFolders(subfolder = "") {
  return folders.map(folder => `${source}/${folder}${subfolder}`);
}

function processCallbacks(tasks, done) {
  return gulp.series(...tasks, seriesDone => {
    seriesDone();
    done();
  })();
}

///////////////////////////////
// SERVE
//////////////////////////////

function compileStyles(done) {
  // const tasks = folders.map(folder => {
    console.log(`${source}/styles/`);
    return src([`${source}/styles/scss/*.scss`].concat(ignoreList), { since: gulp.lastRun(compileStyles) })
        .pipe(dependents())
        .pipe(
          sass({
            outputStyle: "compressed",
            includePaths: [
              "node_modules/"
            ]
          }).on("error", sass.logError)
        )
        .pipe(postcss([
          tailwindcss('./tailwind.config.js'),
          autoprefixer()
        ]))
        .pipe(rename({ dirname: "" })) //required to output to parent directory of sass file
        .pipe(dest(`${source}/styles/`));
        // });
        // done();
  // // This is to ensure callback is called once task has run.
  // return processCallbacks(tasks, done);
}

function compileScripts(done) {

  // const tasks = folders.map(folder => {
    return src(`${source}/scripts/src/main.src.js`, { allowEmpty: true, since: gulp.lastRun(compileScripts) })
        .pipe(dependents())
        .pipe(
          rollup({ plugins: [rollupBabel(), resolve(), commonjs()] }, "umd")
        )
        .pipe(rename("main.js"))
        .pipe(dest(`${source}/scripts/`));
        // done();
  // });
  
  // return processCallbacks(tasks, done);
}

function initBrowserSync() {
  
  server = browserSync.init({
    open: false,
    notify: false,
    port: 9000,
    server: {
      baseDir: `./${source}`
    }
  });

  watch(
    `${source}/styles/scss/*.scss`,
    series(compileStyles)
  );
  watch(`${source}/scripts/src/*.js`, series(compileScripts));
  watch(formats).on("change", browserSync.reload);
}

exports.serve = series(
  compileStyles,
  compileScripts,
  initBrowserSync
);

///////////////////////////////
// BUILD
///////////////////////////////

function buildScripts(done) {
  // const tasks = folders.map(folder => {
    return src(
        [
          `${source}/**/*.js`,
          `!${source}/scripts/src/*.js`
        ].concat(ignoreList)
      )
        // .pipe(babel())
        .pipe(dest(`${publish}/`));
  // });
  // return processCallbacks(tasks, done);
}

function buildStyles(done) {
  
  let cssnanoConfig = {
    preset: 'default'
  };
  
  let purgecssConfig = {
    content: ['./app/**/*.html'],
    defaultExtractor: content =>
                  content.match(/[\w-/:]+(?<!:)/g) || []
  };
  
  let plugins = [
    tailwindcss('./tailwind.config.js'),
    cssnano(cssnanoConfig),
    purgecss(purgecssConfig),
    autoprefixer
  ];
  
  // const tasks = folders.map(folder => {
    return src([`${source}/**/*.css`].concat(ignoreList))
      .pipe(postcss(plugins))
        .pipe(dest(`${publish}/`));
  // });
  // return processCallbacks(tasks, done);
}

function buildHtml() {
  return src([`${source}/**/*.html`].concat(ignoreList.slice(1))).pipe(
    gulp.dest(publish)
  );
}

function buildImages() {
  return src([`${source}/**/images/**/*`].concat(ignoreList))
    .pipe(dest(publish));
}

function buildCopyRest(done) {
  // const tasks = folders.map(folder => {
    return src(
        [
          `${source}/**/*.*`,
          `!${source}/**/*.html`,
          `!${source}/**/*.js`,
          `!${source}/**/*.css`,
          `!${source}/**/*.scss`,
          `!${source}/styles/scss`,
          `!${source}/` + imageFormats
        ].concat(ignoreList)
      ).pipe(dest(`${publish}/`));
  // });
  // return processCallbacks(tasks, done);
}

// function buildZips(done) {
//   const tasks = folders.map(folder => {
//     return () =>
//       src(`${publish}/**/*`)
//         .pipe(zip(folder + ".zip"))
//         .pipe(dest(`${publish}/${folder}/`));
//   });
//   return processCallbacks(tasks, done);
// }

function initBrowserSyncBuild() {
  server = browserSync.init({
    // open: false,
    notify: false,
    port: 9000,
    server: {
      baseDir: `./${publish}`,
    }
  });
}

exports.build = series(
  clean,
  buildScripts,
  buildStyles,
  buildHtml,
  buildCopyRest, // Moved to before buildImages or 'rest' folders missed by zip!
  buildImages,
  // buildZips,
  initBrowserSyncBuild,
  () => {
    return src(`${publish}/**/*`).pipe(size({ title: "build", gzip: true }));
  }
);

exports.buildNoServe = series(
  clean,
  buildScripts,
  buildStyles,
  buildHtml,
  buildCopyRest, // Moved to before buildImages or 'rest' folders missed by zip!
  buildImages,
  () => {
    return src(`${publish}/**/*`).pipe(size({ title: "build", gzip: true }));
  }
);

exports.default = exports.serve;
