//Importujeme knižnicu Axios, cez ktorú ''zavoláme'' na stránku pod requestom GET
const axios = require('axios').default;
//Importujeme ďalšiu knižnicu, pomocou ktorej budeme vyťahovať data zo zvolenej stránky
const cheerio = require('cheerio');

module.exports = {axios, cheerio};
