import gulp from 'gulp';
import pug from 'gulp-pug';
import filter from 'gulp-filter'
import mjml from 'gulp-mjml';
import mjml2html from 'mjml';
import { minify as htmlmin } from 'html-minifier-terser';
import rename from 'gulp-rename';
import clean from 'gulp-clean';
import through2 from 'through2';
import htmlhint from 'gulp-htmlhint';
import filesize from 'gulp-filesize';
// Image Compression et Poids
import imagemin from 'gulp-imagemin';
import gifsicle from 'imagemin-gifsicle';
import mozjpeg from 'imagemin-mozjpeg';
import optipng from 'imagemin-optipng';
// Serveur
import liveServer from 'live-server';

// Tâche pour démarrer le serveur Live Server
gulp.task('serve', (done) => {
    const params ={
        port: 8080, // Choisissez un port
        root: 'dist',
        open: true,
        file:'index.html',
        wait: 500
    };
    liveServer.start(params);
    done();
});

//Vérification du poids des fichiers Html et des balises alt
gulp.task('verification', function(){
    return gulp.src('dist/*.html')
    .pipe(htmlhint({
        "alt-require": true // Exige que toutes les balises <img> aient un attribut alt
    }))
    .pipe(htmlhint.reporter())
    .pipe(filesize())
    .pipe(gulp.dest('./dist'))
})


// Compression des images
gulp.task('compressImg', function(){
    return gulp.src('./src/images/*.{png,jpg,gif}')
        .pipe(filesize({title: 'Taille des images avant compression'}))   
        .pipe(imagemin([
            gifsicle({ interlaced: true, optimizationLevel: 3 }),
            mozjpeg({ quality: 75, progressive: true }),
            optipng({ optimizationLevel: 5 })
        ]))
        .pipe(filesize({title: 'Taille des images après compression'}))
        .pipe(gulp.dest('./dist/images'));
});


// Tâche de nettoyage du dossier de distribution
gulp.task('clean', function(){
    return gulp.src('./dist', {allowEmpty: true, read: false})
        .pipe(clean());
}); 

// Conversion Pug vers Mjml
gulp.task('pug-to-mjml', function(){
    const pugFiles = filter(['**/*.pug', '!**/_*.pug']);
    return gulp.src('./src/*.pug')
        .pipe(pugFiles)
        .pipe(pug({
            // Options de compilation
            pretty: true, //Garder une mise en forme lisible pendant le développement
            debug: true,             // Activer le mode debug
            compileDebug: false,      // Ajouter du code de débogage à la fonction compilée
            globals: [],              // Variables globales disponibles dans tous les templates
            self: false,              // Utiliser 'self' au lieu de 'this'
        }))
        .pipe(rename({extname: '.mjml'}))
        .pipe(gulp.dest('./src/mjml'));
});

// Conversion MJML vers HTML
gulp.task('mjml-to-html', function() {
    return gulp.src('./src/mjml/*.mjml')
        .pipe(mjml(mjml2html, {
            beautify: false,
            minify: false,
            validationLevel: 'strict', //soft skip
            fonts: {},
            keepComments: false,
            ignoreIncludes: true,
            preprocessors: [],
            useMjmlConfigOptions: false, // Utiliser les options du fichier .mjmlconfig
        }))
        .pipe(gulp.dest('./dist'));
});

// Minification HTML
gulp.task('minify-html', function() {
    return gulp.src('./dist/*.html')
        .pipe(through2.obj(async function(file, enc, callback){
            // Minifie le contenu HTML
                const minified = await htmlmin(String(file.contents), {
                    collapseWhitespace: true,
                    removeComments: true,
                    removeEmptyAttributes: true,
                    minifyCSS: true
                });
                file.contents = Buffer.from(minified);
                callback(null, file);
        }))
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('dist'));
});

// Tâche de surveillance
gulp.task('watch', function(){
    gulp.watch('./src/*.pug', gulp.series('pug-to-mjml', 'mjml-to-html', 'minify-html', 'serve'));
});

// Tâche par défaut
gulp.task('default', gulp.series(
    'clean',
    'pug-to-mjml',
    'mjml-to-html',
    'minify-html',
    'verification',
    'serve'
));