const {axios, cheerio} = require('./imports.js');

/**
 * Ziskava denné menu zo stránky https://www.pivnice-ucapa.cz/denni-menu.php
 * @returns výpis na obrazovku denného menu pomocou console.log
 */
const getCapMenu = async() => {
    //Pivnice u Čápa
    //Zavolame na prvú stránku pod requestom GET
    axios.get('https://www.pivnice-ucapa.cz/denni-menu.php').then((response) => {
        //Hneď ako sa nám vráti Promise,tak sa pozrieme, či status odozvy je OK..
        if(response.status === 200) {
            let listArray = new Array();
            let dayFound = false;
            listArray["soups"] = new Array(); 
            listArray["courses"] = new Array();
            listArray["daysInWeek"] = new Array();
            //Pomocou knižnice cheerio získame celý HTML kód stránky a uložíme
            //ich do premennej '$' -- zvyk z jQuery. 
            let $ = cheerio.load(response.data);

            let today = new Date().getDate().toString();

            //Vyber parent class.
            let list = $('div.listek');
            //Zistí, koľko dní existuje v menu.
            let listLength = list.children(`div.row`);

            //Preletí cez všetky dni a zhromáždi data (polievky, chody..)
            for(let x = 1; x < listLength.length + 1; x++) {
                //Vybere konkrétny deň
                let day = list.children(`div.row:nth-child(${x})`);
                //Vybere celý jedálníčok pre konkrétny deň
                let totalCourse = day.children(`div.col-md-9`);
                //Vybere dátum, kedy tento jedálníčok je podávaný
                let courseDay = day.children(`div.col-md-3`).children(`div.term`).children(`div.date`).text().split('.')[0];
                //Uloží dátum do poľa.
                listArray["daysInWeek"].push(courseDay);
                //Zistí názov polievky a vloží ju do poľa s názvom soups.
                let soup = totalCourse.children(`div.row-polevka`);
                listArray["soups"].push( soup.text().replace(/[\n\t]/g, '') );
                //Získa access k všetkým jedlám počas týždňa.
                let coursesLength = totalCourse.children(`div.row-food`);
                //Prejde cez každý jeden jedálníčok..
                for(let y = 2; y < coursesLength.length + 2; y++) {
                    //Vybere y-te jedlo.
                    let course = totalCourse.children(`div.row-food:nth-child(${y})`);
                    //Zistí HTML kód y-teho jedla (kde sa nachádza aj názov jedla)
                    let courseText = course.children(`div.col-md-9`);
                    //Uloží názov jedla do poľa s názvom courses
                    listArray["courses"].push(courseText.text());
                }
            }

            console.log('\nDnes majú nasledovné menu v reštaurácii Pivnice u Čápa:');
            //Prejde cez každý pracovný deň v týždni z poľa.
            for(let i = 0; i < listArray["daysInWeek"].length; i++) {
                //Porovnáme, či aktuálny deň sa rovná konkrétnemu dňu `i` v poli.
                if(today === listArray["daysInWeek"][i]) {
                    //Vypíš všetko potrebné pre daný deň...
                    console.log('Polievka: ' + listArray["soups"][i]);
                    console.log('Chody:');
                    //Keďže počet jediel za jeden deň je číslo 3, tak ak ku dňu pripočítame `1` (aby sme nezačínali od nuly) a vynásobíme to tromi,
                    //tak máme štartovnú pozíciu, od ktorej môžme začať vypisovať chody na konkrétny deň. Podmienka zabezpečuje vypísane iba troch jedál.
                    for(let z = ((i + 1) * 3) - 3; z <= (((i + 1) * 3) - 1); z++)
                        console.log(listArray["courses"][z]);
                    dayFound = true;
                }
            }
            if(dayFound === false) 
                console.log('Ľutujeme, ale na tento deň žiadne menu nie je. Príd najbližšie v pondelok!');
        }
    }).catch((error) => {
        //Ak sa nepodarí handshake medzi serverom a mojím programom, vyhoď hlášku.
        console.log('Nepodarilo sa získať informácie zo stránky Pivnice u Čápa.');
    });
}

/**
 * Získava denné menu zo stránky https://www.suzies.cz/poledni-menu
 * @returns výpis na obrazovku denného menu pomocou console.log
 */
const getSuzieMenu = async() => {
    //Suzie`s
    axios.get('https://www.suzies.cz/poledni-menu').then((response) => {
        if(response.status === 200) {
            //Premenné....
            let $ = cheerio.load(response.data);
            let totalLists = $('div.uk-card');
            let allReqLists = totalLists.children(`div.uk-card-body`);
            let currDay = new Date().getDate();
            let isListAvailable = false;

            console.log("Dnes majú nasledovné menu v reštaurácií Suzie`s: ");

            //Prejde cez všetky `deti` rodiča, kde sa nachádzajú listy.
            for(let x = 1; x < 10; x++) {
                //Keďže nie každé dieťa je náš list (to znamená, že nejdú za sebou ako 1,2,3,4 ale iba ako 1,3,5), tak použijeme podmienku,
                //ktorá zabezpečí len výber nepárnych hodnôt loopu.
                if(x % 2 === 0)
                    continue;

                //Zistím aký dátum sa nachádza v konkrétnom liste a splitnem ho podľa potreby tak, aby som dostal len číslo dňa.
                let listDateString = $(`#food-grid > div.uk-width-expand\\@m.menu-pages > div > div:nth-child(${x}) > h2`).first().text(); 
                var listDay = listDateString.split(' ').pop().split('.')[0];

                //Ak dátum na liste rovná dnešnému dňu, pokračujem v programe..
                if(listDay === currDay.toString())
                {
                    //Keďže v jedálničku nie sú len jedlá, ale aj nadpisy, tak dokopy ich je 20.
                    //Loop prejde cez všetky prvky v rodiči.
                    for(let y = 1; y < 20; y++) {
                        //Nepárne čísla sú nadpisy, tak pridám podmienku, ktorá zamedzí párnym číslam.
                        if(y % 2 === 0)
                            continue;
                        //Začíname od dvojky (mohlo to byť aj v loope vyššie)
                        if(y > 2){
                            //Ak sme na tretej pozícií, to je naša polievka.. keďže `div` polievky obsahuje v sebe iné vnútro ako ostatné jedlá, tak ju vypíšem
                            //samostatne..
                            if(y === 3) {
                                //Uložím konkrétny názov jedla (v tomto prípade polievka)
                                let mealName = $(`#food-grid > div.uk-width-expand\\@m.menu-pages > div > div:nth-child(${x}) > h3:nth-child(${y})`).text();
                                //Vypíšem názov (polievka)
                                console.log(mealName + ":");
                                //Vypíšem typ polievky (keďže typy jedál sú vždy v párnom počte v rodiči, tak navýšim y o 1)
                                console.log($(`#food-grid > div.uk-width-expand\\@m.menu-pages > div > div:nth-child(${x}) > div:nth-child(${y+1})`).text());
                                console.log("\n");
                            }
                            //Akonáhle sme presiahli polievku v liste, tak ideme na ostatné jedlá (pizza, ...)
                            else if(y > 3) {
                                //Konkrétny názov jedla (všetko ostatné okrem polievky)
                                let mealName = $(`#food-grid > div.uk-width-expand\\@m.menu-pages > div > div:nth-child(${x}) > h3:nth-child(${y})`).text();
                                //Vypíšem názov jedla
                                console.log(mealName + ":");
                                //Vypíšem typ jedla.
                                console.log($(`#food-grid > div.uk-width-expand\\@m.menu-pages > div > div:nth-child(${x}) > div:nth-child(${y+1}) > div:nth-child(1)`).text().trim());
                                console.log("\n");
                            }
                        }
                    }
                    //Akonáhle sme našli list, v ktorom je taký istý deň ako je dnes, tak to je naša dnešná ponuka
                    //tak nastav, že sme to našli (true)
                    isListAvailable = true;
                }
            }
            //Akonáhle sa nenašiel žiaden list (je sobota, nedeľa), vypíš správu...
            if(isListAvailable === false)
                console.log('Dnes nie je v reštaurácii Suzie`s žiadne denné menu k dispozicii. Vráť sa najbližšie v Pondelok!');
        }
    }).catch((err) => {
        console.log('Nepodarilo sa získať informácie zo stránky Suzie`s.');
    });
}

/**
 * Získava denné menu zo stránky https://www.menicka.cz/4921-veroni-coffee--chocolate.html
 * @returns výpis na obrazovku denného menu pomocou console.log
 */
const getVeroniCoffee = async() => {
    //VERONI caffee & chocolate
    axios.get('https://www.menicka.cz/4921-veroni-coffee--chocolate.html').then((response) => {
        
        let $ = cheerio.load(response.data); 
        //Získaj klásu 'obsah', kde sa nachádza naše menu.. (a vyber z nej všetky deti obsahujuce klasu 'menicka')
        let obsah = $('#menicka > div > div.text > div.profile > div.obsah > div.menicka');
        //Zisti, aký je dnešný deň a zapíš do premennej
        let currDay = new Date().getDate();
        
        console.log('\n\nDnes majú nasledovné menu v reštaurácií VERONI coffee & chocolate: ');

        //Prejdi cez všetky 'menu', ktoré sú každý deň..
        for(let x = 3; x <= obsah.length; x++) {
            //Vyber konkrétne menu..
            let currMenu = $(`#menicka > div > div.text > div.profile > div.obsah > div.menicka:nth-child(${x})`);
            //Vyber konkrétny dátum pre toto menu..
            let currDate = currMenu.children(`div.nadpis`).text().replace(/\s\s+/g, ' ');;
            //Upravím dátum, kde vybere len jedno číslo.. (deň v mesiaci)
            let currListDay = currDate.split(' ').pop().split('.')[0];
            //Zistím, či práve tento deň v liste sa rovná aktuálnemu dňu v reálnom svete
            if(currListDay === currDay.toString()) {
                //Dlžka menu
                let menuLen = $(`#menicka > div > div.text > div.profile > div.obsah > div:nth-child(${x}) > ul > li`).length;
                //Prejdem cez každý item a vypíšem ho.
                for(let i = 1; i <= menuLen; i++) {
                    //Vyberem konkrétny item z menu
                    let menuItem = $(`#menicka > div > div.text > div.profile > div.obsah > div:nth-child(${x}) > ul > li:nth-child(${i})`).text().replace(/\s\s+/g, ' ');
                    //Vypíš polievku
                    console.log(menuItem);
                }
            }
        }
    }).catch((err) => {
        console.log('Nepodarilo sa získať informácie zo stránky VERONI coffee & chocolate.');
    });
}


module.exports = {getCapMenu, getSuzieMenu, getVeroniCoffee};