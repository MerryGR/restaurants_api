//Hlavný program..

const {getCapMenu, getSuzieMenu, getVeroniCoffee} = require('./api');
var p_Args = process.argv.slice(2);

if(p_Args.length > 0) {
    if(p_Args[0] === "cap")
        getCapMenu();
    else if(p_Args[0] === "suzie")
        getSuzieMenu();
    else if(p_Args[0] === "veroni")
        getVeroniCoffee();

} else console.log('Musite zadefinovat, z ktorej restauracie chcete denne menu! \nPriklad: node index.js {cap|suzie|veroni}');




