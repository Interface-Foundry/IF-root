var unirest = require("unirest");

var req = unirest("POST", "http://www.dsw.com/dsw_shoes/product/206963/find");

req.headers({
    "referer": "http//www.dsw.com/shoe/converse+chuck+taylor+all+star+madison+sneaker+-+womens?prodId=331469&activeCategory=102444&category=dsw12cat880002&activeCats=cat10006,dsw12cat880002",
    "host": "www.dsw.com",
    "origin": "http//www.dsw.com",
    "cookie": "JSESSIONID=UBaheq8bn75GZEB6RvYldBsp.ATGPS03; __utmt=1; collectionJustSampled=false; navHistory=%7B%22left%22%3A%7B%22path%22%3A%5B%7B%22text%22%3A%22New%20Arrivals%22%7D%5D%2C%22hier%22%3A%5B%7B%22text%22%3A%22New%20Arrivals%22%2C%22clicked%22%3Atrue%7D%5D%2C%22count%22%3A1%7D%2C%22top%22%3A%7B%22path%22%3A%5B%22WOMEN%22%2C%22WOMEN%22%2C%22WOMEN%22%5D%2C%22hier%22%3A%22WOMEN%22%2C%22count%22%3A3%7D%7D; mbox=PC#1440452491506-678827.28_39#1442008423|check#true#1440798883|session#1440798810310-115384#1440800683; __utma=253152284.2073109278.1440452492.1440791106.1440798810.4; __utmb=253152284.4.10.1440798810; __utmc=253152284; __utmz=253152284.1440791106.3.2.utmcsr=dsw.com|utmccn=(referral)|utmcmd=referral|utmcct=/Womens-Shoes-New-Arrivals/_/N-271o; DSWsession=%7B%22auth%22%3Afalse%2C%22expiredPassword%22%3Afalse%2C%22shedding%22%3Afalse%2C%22myUSOverlay%22%3Atrue%2C%22billingPostalCode%22%3A%22%22%7D; DSWstorage=%7B%22pid%22%3A%221965409799%22%2C%22fn%22%3A%22%22%2C%22ldw%22%3A%22A01%22%2C%22lod%22%3A%229999-09-09%22%2C%22pseg%22%3A%22ANON%22%2C%22bagcount%22%3A%220%22%2C%22countryCode%22%3A%22US%22%2C%22segment%22%3A%22FEMALE%22%7D; s_pers=%20s_vnum%3D1441080000487%2526vn%253D5%7C1441080000487%3B%20s_dp_persist%3DWomen%7C1440885213044%3B%20s_nr%3D1440798829169-Repeat%7C1443390829169%3B%20s_invisit%3Dtrue%7C1440800629172%3B%20s_lv%3D1440798829176%7C1535406829176%3B%20s_lv_s%3DLess%2520than%25201%2520day%7C1440800629176%3B%20gpv_pt%3Dpdp%7C1440800629182%3B%20gpv_pn%3DBOPIS%2520STOCK%2520LOCATOR%253A%2520SEARCH%7C1440800629184%3B; s_sess=%20s_cc%3Dtrue%3B%20s_evar7%3D4%253A30PM%3B%20s_evar8%3DFriday%3B%20s_evar9%3DWeekday%3B%20s_evar10%3DRepeat%3B%20s_evar11%3D5%3B%20s_evar12%3DLess%2520than%25201%2520day%3B%20s_sq%3D%3B; s_vi=[CS]v1|2AEDC7C20507A515-4000010D4004B806[CE]",
    "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.130 Safari/537.36",
    "content-type": "application/x-www-form-urlencoded; charset=UTF-8"
});

req.form({
    "sizes": "1000016",
    "widths": "M",
    "zipCode": "10002",
    "lineItem.product.id": "206963",
    "color": "dsw12color39200221",
    "size": "1000016",
    "width": "M"
});

req.end(function (res) {
    if (res.error) throw new Error(res.error);

    console.log(res.body);
});
