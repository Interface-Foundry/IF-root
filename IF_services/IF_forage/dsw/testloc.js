var request = require('request');
var zlib = require('zlib');
var fs = require('fs');

var body = 'sizes=1000016&widths=M&zipCode=10002&city=&state=&categoryName=&categoryId=&lineItem.product.id=206963&color=dsw12color39200221&size=1000016&width=M&lineItem.id=&lineItem.commerceItemId=';
var url = 'http://www.dsw.com/dsw_shoes/product/206963/find'
var headers = {
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.130 Safari/537.36',
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'Accept-Encoding': 'gzip, deflate',
    'Referer': 'http://www.dsw.com/shoe/b.o.c+peggy+smooth+leather+clog?prodId=206963&activeCategory=102444&category=dsw12cat880002&activeCats=cat10006,dsw12cat880002',
    'X-Requested-With': 'XMLHttpRequest',
    'Cookie': 'collectionJustSampled=false; navHistory=%7B%22left%22%3A%7B%22path%22%3A%5B%7B%22text%22%3A%22New%20Arrivals%22%7D%5D%2C%22hier%22%3A%5B%7B%22text%22%3A%22New%20Arrivals%22%2C%22clicked%22%3Atrue%7D%5D%2C%22count%22%3A1%7D%2C%22top%22%3A%7B%22path%22%3A%5B%22WOMEN%22%2C%22WOMEN%22%5D%2C%22hier%22%3A%22WOMEN%22%2C%22count%22%3A2%7D%7D; JSESSIONID=AmHMDWJpmaUPiUzDCf7IJpfZ.ATGPS03; mbox=PC#1440452491506-678827.28_39#1442001078|session#1440791105936-605001#1440793338|check#true#1440791538; __utma=253152284.2073109278.1440452492.1440787431.1440791106.3; __utmb=253152284.8.10.1440791106; __utmc=253152284; __utmz=253152284.1440791106.3.2.utmcsr=dsw.com|utmccn=(referral)|utmcmd=referral|utmcct=/Womens-Shoes-New-Arrivals/_/N-271o; DSWsession=%7B%22auth%22%3Afalse%2C%22expiredPassword%22%3Afalse%2C%22shedding%22%3Afalse%2C%22myUSOverlay%22%3Atrue%2C%22billingPostalCode%22%3A%22%22%7D; DSWstorage=%7B%22pid%22%3A%221965288528%22%2C%22fn%22%3A%22%22%2C%22ldw%22%3A%22A01%22%2C%22lod%22%3A%229999-09-09%22%2C%22pseg%22%3A%22ANON%22%2C%22bagcount%22%3A%220%22%2C%22countryCode%22%3A%22US%22%2C%22segment%22%3A%22FEMALE%22%7D; s_vi=[CS]v1|2AEDC7C20507A515-4000010D4004B806[CE]; s_sess=%20s_cc%3Dtrue%3B%20s_sq%3D%3B%20s_evar7%3D2%253A30PM%3B%20s_evar8%3DFriday%3B%20s_evar9%3DWeekday%3B%20s_evar10%3DRepeat%3B%20s_evar11%3D4%3B%20s_evar12%3DLess%2520than%25201%2520day%3B; s_pers=%20s_dp_persist%3DWomen%7C1440873851673%3B%20s_vnum%3D1441080000487%2526vn%253D4%7C1441080000487%3B%20s_nr%3D1440791916044-Repeat%7C1443383916044%3B%20s_invisit%3Dtrue%7C1440793716049%3B%20s_lv%3D1440791916053%7C1535399916053%3B%20s_lv_s%3DLess%2520than%25201%2520day%7C1440793716053%3B%20gpv_pt%3Dpdp%7C1440793716060%3B%20gpv_pn%3DBOPIS%2520STOCK%2520LOCATOR%253A%2520SEARCH%7C1440793716062%3B',
    //'Accept': 'text/html, application/xml, text/xml, */*'
}
var form = {
    size: '1000016',
    width: 'M',
    zipCode: '10002',
    city: '',
    state: '',
    'lineItem.product.id': '206963',
    color: 'dsw12color39200221',
    sizes: '1000016',
    widths: 'M'
}

request.post({
    url: url,
    headers: headers,
    form: form
})
    .pipe(zlib.createGunzip())
    .pipe(fs.createWriteStream('./dsw.html'));