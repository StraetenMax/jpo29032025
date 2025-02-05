const gulp = require('gulp');
const pug = require('gulp-pug');
const mjml = require('gulp-mjml');
const htmlmin = require('gulp-htmlmin');
const rename = require('gulp-rename');
const clean= require('gulp-clean');

// Chemins de fichiers
const paths = {
    pug: './src/templates/*.pug',
    mjml: './src/mjml/',
    dist: './dist/'
};

// Tâche de nettoyage du dossier de distribution
gulp.task('clean', function(){
    return gulp.src(paths.dist, {read: false, allowEmpty: true})
        .pipe(clean());
});

// Conversion Pug vers Mjml
gulp.task('pug-to-mjml', function(){
    return gulp.src(paths.pug)
        .pipe(pug({
            pretty: true //Garder une mise en forme lisible pendant le développement
        }))
        .pipe(gulp.dest(paths.mjml));
});

// Conversion MJML vers HTML
gulp.task('mjml-to-html', function() {
    return gulp.src(`${paths.mjml}*.mjml`)
        .pipe(mjml())
        .pipe(gulp.dest(paths.dist));
});

// Minification HTML
gulp.task('minify-html', function() {
    return gulp.src(`${paths.dist}*.html`)
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true,
            minifycss: true
        }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(paths.dist));
});

// Tâche de surveillance
gulp.task('watch', function(){
    gulp.watch(paths.pug, gulp.series('pug-to-mjml', 'mjml-to-html', 'minify-html'));
});

// Tâche par défaut
gulp.task('default', gulp.series(
    'clean',
    'pug-to-mjml',
    'mjml-to-html',
    'minify-html'
));