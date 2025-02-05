const gulp = require('gulp');
const pug = require('gulp-pug');
const mjml = require('gulp-mjml');
const mjml2html = require('mjml');
const htmlmin = require('html-minifier-terser').minify;
const rename = require('gulp-rename');
const clean= require('gulp-clean');
const through2= require('through2');
const imagemin= require('gulp-imagemin');

// Compression des images
gulp.task('compress-images', function(){
    return gulp.src('src/images/*.{png,jpg,gif}')
        .pipe(imagemin([
            imagemin.gifsicle({interlaced: true, optimizationLevel: 3}),
            imagemin.mozjpeg({quality: 75, progressive: true}),
            imagemin.optipng({optimizationLevel: 5 })
        ]))
        .pipe(gulp.dest('dist/images'));
});


// Tâche de nettoyage du dossier de distribution
gulp.task('clean', function(){
    return gulp.src('./dist', {read: false, allowEmpty: true})
        .pipe(clean());
});

// Conversion Pug vers Mjml
gulp.task('pug-to-mjml', function(){
    return gulp.src('./src/templates/*.pug')
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
        .pipe(mjml(mjml2html)
            // Options MJML
            //beautify: true, // Formatage du HTML généré
            //minify: false, // Minification du HTML généré
            //validation: "strict", // Mode de validation : "strict", "soft" ou "skip"
            //fonts: {}, // Configuration des polices personnalisées
            //keepComments: false, // Conserver les commentaires
            //filePath: '', // Chemin pour les includes MJML
            //juicePreserveTags: [], // Préserver certaines balises lors de l'inlining CSS
            //minifyOptions: {}, // Options spécifiques pour la minification
            //useMjmlConfigOptions: true, // Utiliser les options du fichier .mjmlconfig
            //mjmlConfigPath: null, // Chemin vers le fichier .mjmlconfig
)
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
    gulp.watch('./src/templates/*.pug', gulp.series('pug-to-mjml', 'mjml-to-html', 'minify-html'));
});

// Tâche par défaut
gulp.task('default', gulp.series(
    'clean',
    'pug-to-mjml',
    'mjml-to-html',
    'minify-html'
));