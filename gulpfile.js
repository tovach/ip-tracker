let fileswatch = "html,htm,txt,json,md,woff2"; // List of files extensions for watching & hard reload

import pkg from "gulp";
const { gulp, src, dest, parallel, series, watch } = pkg;

import sourcemaps from "gulp-sourcemaps";
import browserSync from "browser-sync";
import bssi from "browsersync-ssi";
import ssi from "ssi";
import webpackStream from "webpack-stream";
import webpack from "webpack";
import gulpSass from "gulp-sass";
import dartSass from "sass";
import sassglob from "gulp-sass-glob";
const sass = gulpSass(dartSass);
import postCss from "gulp-postcss";
import cssnano from "cssnano";
import autoprefixer from "autoprefixer";
import imagemin from "gulp-imagemin";
import changed from "gulp-changed";
import concat from "gulp-concat";
import del from "del";
import { webpackConfig } from "./webpack.config.js";

function browsersync() {
  browserSync.init({
    server: {
      baseDir: "app/",
      middleware: bssi({ baseDir: "app/", ext: ".html" }),
    },
    ghostMode: { clicks: false },
    notify: false,
    online: true,
    // tunnel: 'x79tovach', // Attempt to use the URL https://x79tovach.loca.lt
  });
}

function scripts() {
  webpackConfig.mode = "development";
  webpackConfig.devtool = "source-map";
  return src(["app/js/*.js", "!app/js/*.min.js"])
    .pipe(webpackStream(webpackConfig, webpack))
    .on("error", (err) => {
      console.log("Webpack ERROR =>", err);
      this.emit("end");
    })
    .pipe(dest("app/js"))
    .pipe(browserSync.stream());
}

function scriptsBuild() {
  webpackConfig.mode = "production";
  return src(["app/js/*.js", "!app/js/*.min.js"])
    .pipe(webpackStream(webpackConfig, webpack))
    .on("error", (err) => {
      console.log("Webpack ERROR =>", err);
      this.emit("end");
    })
    .pipe(dest("app/js"))
    .pipe(browserSync.stream());
}

function styles() {
  return src([`app/scss/*.*`, `!app/scss/_*.*`])
    .pipe(sourcemaps.init())
    .pipe(sassglob())
    .pipe(sass({ "include css": true, includePaths: ["node_modules"] }))
    .pipe(
      postCss([
        autoprefixer({ grid: "autoplace" }),
        cssnano({
          preset: ["default", { discardComments: { removeAll: true } }],
        }),
      ])
    )
    .pipe(concat("app.min.css"))
    .pipe(sourcemaps.write())
    .pipe(dest("app/css"))
    .pipe(browserSync.stream());
}

function stylesBuild() {
  return src([`app/scss/*.*`, `!app/scss/_*.*`])
    .pipe(sassglob())
    .pipe(sass({ "include css": true, includePaths: ["node_modules"] }))
    .pipe(
      postCss([
        autoprefixer({ grid: "autoplace" }),
        cssnano({
          preset: ["default", { discardComments: { removeAll: true } }],
        }),
      ])
    )
    .pipe(concat("app.min.css"))
    .pipe(dest("app/css"))
    .pipe(browserSync.stream());
}

function images() {
  return src(["app/images/src/**/*"])
    .pipe(changed("app/images/compressed"))
    .pipe(imagemin())
    .pipe(dest("app/images/compressed"))
    .pipe(browserSync.stream());
}

function buildcopy() {
  return src(
    [
      "{app/js,app/css}/*.min.*",
      "app/images/**/*.*",
      "!app/images/src/**/*",
      "app/fonts/**/*",
    ],
    { base: "app/" }
  ).pipe(dest("dist"));
}

async function buildhtml() {
  let includes = new ssi("app/", "dist/", "/**/*.html");
  includes.compile();
  del("dist/components", { force: true });
}

async function cleandist() {
  del("dist/**/*", { force: true });
}

function startwatch() {
  watch(
    ["./app/scss/**/*.{scss,sass}", "./app/components/**/*.{scss,sass}"],
    { usePolling: true },
    styles
  );
  watch(
    ["app/js/**/*.js", "!app/js/**/*.min.js"],
    { usePolling: true },
    scripts
  );
  watch("app/images/src/**/*", { usePolling: true }, images);
  watch(`app/**/*.{${fileswatch}}`, { usePolling: true }).on(
    "change",
    browserSync.reload
  );
}

export let build = series(
  cleandist,
  images,
  scriptsBuild,
  stylesBuild,
  buildcopy,
  buildhtml
);

export default series(
  scripts,
  styles,
  images,
  parallel(browsersync, startwatch)
);
