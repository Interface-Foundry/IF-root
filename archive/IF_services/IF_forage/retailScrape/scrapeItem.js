/**
 * Scrapes an items from a URL
 * @param url specific item page
 * @param row row from the retail spreadsheet
 */
function scrapeItem(url, row) {
    (new Promise(function(resolve, reject) {
        //make sure there's a user who is the owner in the database
        db.Users.findOne({
            name: site.storeName,
            addr: site.storeAddress
        }).exec(function(e, u) {
            if (e) {
                console.error(e);
                reject(e);
            }
            if (u) {
                site.owner = u.getSimpleUser();
                delete site.owner.avatar;
                resolve();
            } else {
                var owner = new db.User({
                    name: site.storeName,
                    addr: site.storeAddress,
                    profileID: site.storeId
                });
                owner.save(function(e, o) {
                    if (e) {
                        console.error(e);
                        return reject(e);
                    }
                    site.owner = o.getSimpleUser();
                    delete site.owner.avatar;
                    resolve();
                })
            }
        })
    })).then(function() {
            return new Promise(function(resolve, reject) {
                //make sure there's a store who is the parent in the database
                db.Landmarks.findOne({
                    name: site.storeName
                }).exec(function(e, l) {
                    if (e) {
                        console.error(e);
                        reject(e);
                    }
                    if (l) {
                        site.parent = l.getSimpleItem();
                        delete site.parent.itemImageURL;
                        resolve();
                    } else {
                        var store = new db.Landmark({
                            owner: site.owner,
                            world: true,
                            id: site.storeId,
                            loc: site.storeLoc,
                            valid: true,
                            addressString: site.storeAddress,
                            name: site.storeName

                        });
                        store.save(function(e, s) {
                            if (e) {
                                console.error(e);
                                return reject(e);
                            }

                            site.parent = s.getSimpleItem();
                            delete site.parent.itemImageURL;
                            resolve();
                        })
                    }
                })
            })
        }).then(function() {
            site.getUrls().then(function(urls) {
                urls.map(function(url) {
                    scrape({
                        url: url,
                        loc: site.storeLoc,
                        parent: site.parent,
                        owner: site.owner,
                        linkbackname: site.linkbackname,
                        wrapper: site.wrapper,
                        name: site.name,
                        price: site.price,
                        description: site.description,
                        categories: site.categories,
                        itemImageURL: site.itemImageURL,
                        related: site.related
                    })
                })
            })
        })
}

module.exports = scrapeItem;