import gulp from 'gulp';
import pug from 'gulp-pug';
import filter from 'gulp-filter';
import mjml from 'gulp-mjml';
import { minify as htmlmin } from 'html-minifier-terser';
import rename from 'gulp-rename';
import clean from 'gulp-clean';
import through2 from 'through2';
import htmlhint from 'gulp-htmlhint';
import filesize from 'gulp-filesize';
import imagemin from 'gulp-imagemin';
import gifsicle from 'imagemin-gifsicle';
import mozjpeg from 'imagemin-mozjpeg';
import optipng from 'imagemin-optipng';
import imageminSvgo from 'imagemin-svgo'; // Importation spécifique pour svgo
import liveServer from 'live-server';

// Serveur
const serve = (done) => {
    const params = {
        port: 8080,
        root: 'dist',
        open: true,
        file: 'index.html',
        wait: 500
    };
    liveServer.start(params);
    done();
};

// Vérification du poids et des attributs alt
const verification = () => {
    return gulp.src('dist/*.html')
        .pipe(htmlhint({ "alt-require": true }))
        .pipe(htmlhint.reporter())
        .pipe(filesize()); // Filesize après minification
};

// Compression des images
const compressImg = () => {
    return gulp.src('./src/images/*.{png,jpg,gif,svg}')
        .pipe(filesize({ title: 'Taille des images avant compression' }))
        .pipe(imagemin([
            gifsicle({ interlaced: true, optimizationLevel: 3 }),
            mozjpeg({ quality: 75, progressive: true }),
            optipng({ optimizationLevel: 5 }),
            imageminSvgo() // Utilisation de l'importation spécifique
        ]))
        .pipe(filesize({ title: 'Taille des images après compression' }))
        .pipe(gulp.dest('./dist/images'));
};

// Nettoyage
const cleanDist = () => {
    return gulp.src('./dist', { allowEmpty: true, read: false })
        .pipe(clean());
};

// Pug vers Mjml
const pugToMjml = () => {
    return gulp.src('./src/templates/*.pug')
        .pipe(pug({
            pretty: true, // À retirer pour la production
            debug: true, // À retirer pour la production
            compileDebug: false,
            globals: [],
            self: false,
        }))
        .pipe(rename({ extname: '.mjml' }))
        .pipe(gulp.dest('./src/mjml'));
};

// Mjml vers HTML
const mjmlToHtml = () => {
    return gulp.src('./src/mjml/*.mjml')
        .pipe(mjml({ // Utilisation de mjml directement
            beautify: false, // false en production
            minify: false, // Minification faite après
            validationLevel: 'strict',
            fonts: {},
            keepComments: false,
            ignoreIncludes: true,
            preprocessors: [],
            useMjmlConfigOptions: false,
        }))
        .pipe(gulp.dest('./dist'));
};

// Minification HTML
const minifyHtml = () => {
    return gulp.src('./dist/*.html')
        .pipe(through2.obj(async function (file, enc, callback) {
            const minified = await htmlmin(String(file.contents), {
                collapseWhitespace: true,
                removeComments: true,
                removeEmptyAttributes: true,
                minifyCSS: true,
                minifyJS: true // Ajout de la minification du JS
            });
            file.contents = Buffer.from(minified);
            callback(null, file);
        }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('dist'));
};

// Watch
const watch = () => {
    gulp.watch('./src/templates/*.pug', gulp.series(pugToMjml, mjmlToHtml, minifyHtml, verification, serve));
    gulp.watch('./src/images/**/*', gulp.series(compressImg));
};

// Tâche par défaut
const defaultTask = gulp.series(
    cleanDist,
    compressImg,
    pugToMjml,
    mjmlToHtml,
    minifyHtml,
    verification,
    serve,
    watch
);

// Export des tâches
export { serve, verification, compressImg, cleanDist, pugToMjml, mjmlToHtml, minifyHtml, watch, defaultTask as default };