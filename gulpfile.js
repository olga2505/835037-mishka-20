const gulp = require("gulp");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const rename = require("gulp-rename");
const sass = require("gulp-sass");
const postcss = require("gulp-postcss");
const csso = require("gulp-csso");
const autoprefixer = require("autoprefixer");
const htmlmin = require("gulp-htmlmin");
const del = require("del");
const svgstore = require("gulp-svgstore");
const imagemin = require("gulp-imagemin");
const webp = require("gulp-webp");
const uglify = require("gulp-uglify");
const sync = require("browser-sync").create();

// clean
const clean = () => {
  return del("build");
};

exports.clean = clean;

// Styles
const styles = () => {
  return gulp
    .src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(csso())
    .pipe(rename("style.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(sync.stream())
};

exports.styles = styles;

// HTML
const html = () => {
  return gulp
    .src("source/*.html")
    .pipe(
      htmlmin({
        removeComments: true,
        collapseWhitespace: true,
      })
    )
    .pipe(gulp.dest("build"));
};
exports.html = html;

// copy files
const copy = () => {
  return gulp .src([
    "source/fonts/**/*",
    "source/img/**/*",
    "source/*.ico"
  ], {
      base: "source",
    })
    .pipe(gulp.dest("build"))
    .pipe(
      sync.stream({
        once: true,
      })
    );
};

exports.copy = copy;

// images
const images = () => {
  return gulp
    .src("source/img/**/*.{jpg, png, svg}")
    .pipe(imagemin([
      imagemin.optipng( {optimizationLevel: 3} ),
      imagemin.mozjpeg( {progressive: true} ),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest("build/img"));
};

exports.images = images;

// webp
const webpCopy = () => {
  return gulp
    .src("source/img/**/*.{jpg, png}")
    .pipe(webp({ quality: 90 }))
    .pipe(gulp.dest("build/img"));
};

exports.webpCopy = webpCopy;

// svg sprite
const sprite = () => {
  return gulp
    .src("source/img/**/icon-*.svg")
    .pipe(
      imagemin([
        imagemin.svgo({
          plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
        }),
      ])
    )
    .pipe(svgstore())
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img"));
};

exports.sprite = sprite;

//  JavaScript
const scripts = () => {
  return gulp
  .src("source/js/*.js")
  .pipe(uglify())
  .pipe(gulp.dest("build/js"));
};
exports.scripts = scripts;

// Build
const build = gulp.series(
  clean,
  html,
  styles,
  scripts,
  copy,
  images,
  webpCopy,
  sprite
);

exports.build = build;

// Server
const server = (done) => {
  sync.init({
    server: {
      baseDir: "build",
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
};

exports.server = server;

// Watcher
const watcher = () => {
  gulp.watch("source/sass/**/*.scss", gulp.series("styles"));
  gulp.watch("source/*.html", gulp.series("html"));
  gulp.watch("source/**/*.js", gulp.series("scripts"));
  gulp.watch(
    "source/img/**/*.{jpg, png, svg}",
    gulp.series("images", "webpCopy")
  );
  gulp.watch("source/img/**/icon-*.svg", gulp.series("sprite"));
  gulp.watch("source/**/*.{html, js, jpg, png, svg}").on("change", sync.reload);
};

exports.watcher = watcher;

exports.default = gulp.series(
  clean,
  gulp.parallel(html, scripts, copy, images, webpCopy, sprite),
  styles,
  server,
  watcher
);
