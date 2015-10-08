var db = require('db')
var kip = require('kip')

//curl 'http://www.shopstyle.com/api/v2/products?cat=shoes-athletic&device=desktop&includeCategoryHistogram=true&includeProducts=true&limit=40&locales=all&offset=40&pid=shopstyle&prevCat=women&productScore=LessPopularityEpcJob&sort=Popular&track=false&url=%2Fbrowse%2Fshoes-athletic&view=angular' -H 'Accept-Encoding: gzip, deflate, sdch' -H 'Accept-Language: en-US,en;q=0.8' -H 'User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.130 Safari/537.36' -H 'Accept: application/json, text/plain, */*' -H 'Referer: http://www.shopstyle.com/browse/shoes-athletic?sort=Popular' -H 'Cookie: ROV_Blocked=1; sc1="JP//////////AAD//////////wAAAQAJICB1bmtub3duAAAAAP////8AAAABPWAAAP////8AAQAAAAAAAAAAAAA=-CKHZGi6wGaqOiYSg234NTQ=="; sc37=AAMBCEMCABsCAAEAAh0rcU4T4Eil; s_sq=%5B%5BB%5D%5D; firstVisitDate=2015-10-07; originalCampaign=seo%7Cgoogle%20web%20search%7Corganic; ipCountryCode=us; ssas=1; sc11=eyJhYnRlc3RzIjp7InByb2R1Y3RSYW5raW5nU2VwMDkiOiJMZXNzUG9wdWxhcml0eUVwY0pvYiIsInNwb3Rmcm9udDMiOnRydWUsInBvc3RDbGljazQiOmZhbHNlLCJwcm9kdWN0Q2VsbCI6InNpemVBbmRTdHlsZSIsIm1vZHVsYXJTaXRlMyI6ZmFsc2UsInJldHVybkF1dG9RU0EiOnRydWUsImZha2VTbWFydGlPU2Jhbm5lcjIiOmZhbHNlLCJ0b29sVGlwMiI6IklQU0EiLCJtb2JpbGVQcm9tb3Rpb25hbERlYWwiOmZhbHNlLCJmYXZvcml0ZXMiOiJob3ZlciIsInNob3dSaWJib24iOmZhbHNlLCJtb2R1bGFySG9tZXBhZ2UiOmZhbHNlLCJoMXRhZyI6dHJ1ZSwiY21zIjpmYWxzZX0sIl9sYXN0TW9kaWZpZWQiOjE0NDQyMjc1Nzk1NDl9; sc24=150426f8c4c3699309460353106f; userData=%7B%22%24state%22%3A%7B%22prevCat%22%3A%22women%22%7D%7D; amplitude_idshopstyle.com=eyJkZXZpY2VJZCI6IjBiNTIwMWUzLWMzOTgtNDhhNC05YzE4LTkwM2VlZTJhZjFiYiIsInVzZXJJZCI6bnVsbCwib3B0T3V0IjpmYWxzZX0=; s_cc=true; s_fid=5879EAB638D77369-0F9AA701F55B04C2; s_getNewRepeat=1444227609743-Repeat; gpv=ss%3Aus%3Abrowse%20products; sc44=15042ab8dba9107262876350433f; attribution=%7B%22medium%22%3A%22seo%22%2C%22source%22%3A%22google%22%2C%22type%22%3A%22web%22%2C%22email%22%3A%7B%7D%2C%22referrer%22%3A%22https%3A%2F%2Fwww.google.com%2F%22%7D' -H 'Connection: keep-alive' --compressed


// testing
var sample = {
  name: 'Great Trunk',
  description: 'wow',
  tags: [
    'such', 'fun'
  ],
  images: ['def real image'],
  source: 'fake'
}

(new db.TrainingData(sample)).save(function(e, r) {
  kip.fatal(e);
  console.log(r);
})
