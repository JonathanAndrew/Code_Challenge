var request     = require("request");
var cheerio     = require("cheerio");
var csvWriter   = require("csvwriter");
var fs          = require("fs");

var params = {
    google: {
        url:"https://www.google.com/search?q=",
        linkPath:".r a",
        urlMatch:"(?=http|https).*(?=&sa)"
    },
    bing: {
        url:"http://www.bing.com/search?q=",
        linkPath:".b_algo h2 a",
        urlMatch:"(?=http|https).*"
    }
}

var getData = function(searchEngine, keyWord){
    var engineParams = params[searchEngine] ? engineParams = params[searchEngine] : console.log("No search engine requested "+searchEngine);
    var linkArray = [];
    request(engineParams['url']+keyWord, function(err, res, data){
        if (err) {
            console.log(err);
            return false;
        }else {
                var $ = cheerio.load(data);
                $(engineParams['linkPath']).each(function(i, el){
                    var link = $(el).attr('href').match(engineParams["urlMatch"]);
                   if (link !== null) {
                         linkArray.length < 6 ? linkArray.push(link[0]) : false;
                    }else{ false };
                });
            }  
        linkArray.length > 0 ? getTitle(searchEngine,linkArray) : console.log("no results");
    });
}
var getTitle = function(searchEngine, linksArray){
    var titleArray = [];
    linksArray.forEach(function(link, i){
        request(link, function(err, res, data){
            var $ = cheerio.load(data);
            if ($('title').text()){
                titleArray.push($('title').text());
                if (titleArray.length === linksArray.length){
                    var url_and_titles = titleArray.map(function (title, i) {
                        return ['urls '+i+': '+linksArray[i]+'\n title '+i+': '+title];
                    });
                    csvWriter(url_and_titles, function(err, csv){
                        fs.writeFile(searchEngine+".csv", csv, function(err){
                            err ? console.log(err) : console.log(searchEngine+'.csv created');
                        });
                    });
                }
            }
        });
    });
}
if(process.argv.length === 3){
    console.log("Searching Google and Bing!");
    for(var engine in params){
        getData(engine,process.argv[2]);
    }
} else {
    console.log("Script expects one argument");
}