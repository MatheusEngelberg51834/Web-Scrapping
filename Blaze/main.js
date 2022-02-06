const puppeteer = require('puppeteer');
const fs = require('fs');
const cheerio = require('cheerio');

const url = 'https://blaze.com/en/games/crash';
var results = [];
var prevResults = [];

async function getData() {
    console.log('');
    console.log('Starting getData function...');
    console.log('');
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    // Get new temp html
    await page.content()
    .then((html) => {
        fs.writeFile('./temp/data.html', html, err => {
            if (err) console.log(err)
        });
    });
    await browser.close();
    
    // Read temp html, find the previous results
    // and write new results to data.txt
    fs.readFile('./temp/data.html', (err, html) => {
        if (err) console.log(err);

        const $ = cheerio.load(html);
        const previousResults = $('.entries').children().text();
        const _results = previousResults.split('X');

        console.log('Got results: ');
        console.log(_results);
        console.log('');
        
        const newResults = _results.filter(x => prevResults.indexOf(x) === -1);
        console.log('The new results are: ');
        console.log(newResults);
        console.log('');

        results = newResults
        prevResults = _results

        results.forEach(i => { 
            fs.appendFile('data.txt', i + '\n', function (err) {
                if (err) throw err;
            });
        });
        console.log('Pushed new results into DB')
        console.log('Waiting for next call...')
    })
}

getData().then(() => {
    setInterval(getData, 50000)
});