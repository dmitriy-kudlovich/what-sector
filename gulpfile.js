const gulp = require("gulp"); // Подключаем gulp
const browserSync = require("browser-sync").create();
const watch = require("gulp-watch");
const sass = require("gulp-sass");
const autoprefixer = require("gulp-autoprefixer");
const sourcemaps = require("gulp-sourcemaps");
const notify = require("gulp-notify");
const plumber = require("gulp-plumber");
const gcmq = require("gulp-group-css-media-queries");
const sassGlob = require("gulp-sass-glob");
const pug = require("gulp-pug");
const del = require("del");

// Таск для сборки Pug-файлов
gulp.task("pug", function (callback) {
    return gulp
        .src("./src/pug/pages/**/*.pug")
        .pipe(
            plumber({
                errorHandler: notify.onError(function (err) {
                    return {
                        title: "Pug",
                        sound: false,
                        message: err.message,
                    };
                }),
            })
        )
        .pipe(
            pug({
                pretty: true,
            })
        )
        .pipe(gulp.dest("./build/"))
        .pipe(browserSync.stream());
    callback();
});

// Таск для компиляции scss в css
gulp.task("sass", function (callback) {
    return gulp
        .src("src/scss/main.scss")
        .pipe(
            plumber({
                errorHandler: notify.onError(function (err) {
                    return {
                        title: "Styles",
                        sound: false,
                        message: err.message,
                    };
                }),
            })
        )
        .pipe(sourcemaps.init())
        .pipe(sassGlob())
        .pipe(
            sass({
                indentType: "tab",
                indentWidth: 1,
                outputStyle: "expanded",
            })
        )
        .pipe(gcmq())
        .pipe(autoprefixer({ overrideBrowserslist: ["last 4 versions"] }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest("./build/css/"))
        .pipe(browserSync.stream());
    callback();
});

// Копирование изображений
gulp.task("copy:img", function (callback) {
    return gulp.src("./src/img/**/*.*").pipe(gulp.dest("./build/img/"));
    callback();
});

// Копирование JS
gulp.task("copy:js", function (callback) {
    return gulp.src("./src/js/**/*.*").pipe(gulp.dest("./build/js/"));
    callback();
});

// Копирование php
gulp.task("copy:php", function (callback) {
    return gulp.src("./src/php/**/*.*").pipe(gulp.dest("./build/php/"));
    callback();
});

// Копирование libs
gulp.task("copy:libs", function (callback) {
    return gulp.src("./src/libs/**/*.*").pipe(gulp.dest("./build/libs/"));
    callback();
});

gulp.task("watch", function () {
    // Слежение за картинками и скриптами и обновление браузера
    watch(
        [
            "./build/js/**/*.*",
            "./build/img/**/*.*",
            "./build/libs/**/*.*",
            "./build/php/**/*.*",
        ],
        gulp.parallel(browserSync.reload)
    );

    // Слежение за scss c задержкой в 1 секунду
    watch("./src/scss/**/*.scss", function () {
        setTimeout(gulp.parallel("sass"), 1000);
    });

    // Слежение за pug и сборка
    watch("./src/pug/**/*.pug", gulp.parallel("pug"));

    // Слежение за картинками и скриптами, копирование их в build
    watch("./src/img/**/*.*", gulp.parallel("copy:img"));
    watch("./src/js/**/*.*", gulp.parallel("copy:js"));
    watch("./src/libs/**/*.*", gulp.parallel("copy:libs"));
    watch("./src/php/**/*.*", gulp.parallel("copy:php"));
});

// Задача для старта сервера из папки build
gulp.task("browser-sync", function () {
    browserSync.init({
        server: {
            baseDir: "./build/",
        },
    });
});

gulp.task("clean:build", function () {
    return del("./build/");
});

gulp.task(
    "default",
    gulp.series(
        gulp.parallel("clean:build"),
        gulp.parallel(
            "sass",
            "pug",
            "copy:img",
            "copy:js",
            "copy:libs",
            "copy:php"
        ),
        gulp.parallel("browser-sync", "watch")
    )
);
