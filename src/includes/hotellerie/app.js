const fs = require('fs');
const path = require('path');
const pug = require('pug');

// Lire le fichier JSON
const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'dataHotellerie.json5'), 'utf8'));

// Compiler le template Pug avec les données JSON
const compiledFunction = pug.compileFile(path.join(__dirname, '_formations.pug'));
const htmlOutput = compiledFunction({formations: data.formations});

// Afficher le Html généré
console.log(htmlOutput);