require('kip')
var co = require('co')
var _ = require('lodash')
var parse_address = require('parse-address'); 
var addressit = require('addressit');
var ContactParser = require('contact-parser');
var Fuse = require('fuse.js')

function  * parseAddress (location) {

  var address = {
    label: location.street,
    coordinates: location.longitude ? [location.longitude , location.latitude] : [],
    address_1: location.street,
    street: location.street,
    unit_type: '',
    unit_number: location.unit,
    city: location.city,
    state: location.state,
    zip_code: location.zip_code,
    neighborhood: location.neighborhood,
    sublocality: location.sublocality,
    input: location.input
  }

  if (!address.unit_number) {
    var parsed = parse_address.parseLocation(location.input);
    var addressit_res = addressit(address.input);
    if (addressit_res.regions && addressit_res.regions.length > 1) {
      var set = addressit_res.regions.map((r) => { return { name: r } })
      var options = {
        keys: [{ name: 'name', weight: 1}],
        shouldSort: true,
        threshold: 0.99,
        include: ["score"]
      }
      var fuse = new Fuse(set, options)
      var matches = yield fuse.search(address.address_1);
      var candidate;
      if (matches && matches.length > 0 ) {
       // && matches[0].item.name.match(/\d+/g) && matches[0].item.name.match(/\d+/g).length > 0) {
        unit_candidate = matches[0].item.name;
        address.unit_number = unit_candidate.match(/\d+/g)[0];
        address.unit_type = unit_candidate.split(address.unit_number)[1];
        var types = ['fl','apt','attn','unit','floor','apartment','attention']
        var fuse2 = new Fuse(set, options)
        var type_matches = []
        yield types.map(function * (type) {
          var res = yield fuse2.search(type);
          res = res.map((e) => { 
            e.type = type;
            return e;
             });
          type_matches = type_matches.concat(res)
        })
        type_matches.sort(function(a, b) {
          return a.score - b.score;
        });
        address.unit_type = type_matches[0].type;
      }
  }
  else if (parsed.sec_unit_type) {
    address.unit_type = parsed.sec_unit_type;
    var set = address.input.split(' ').length > 1 ? address.input.split(' ') : address.input.split(',')
    var index = set.indexOf(address.unit_type)
    address.unit_number = set[index-1].match(/\d+/g)[0]
  } 
}
 
    return address;

}

/*
* when passing something like "902 broadway, apt 5, ny" into api.searchNearby delivery.com api craps out. this fill fix that
*/
function * cleanAddress(input) {
    var unit_number;
    var unit_type;
    var addressit_res = addressit(input);
    var parsed = parse_address.parseLocation(input);
    if (addressit_res.regions && addressit_res.regions.length > 0) {
      var set = addressit_res.regions.map((r) => { return { name: r }})
      var options = {
        keys: [{ name: 'name', weight: 1}],
        shouldSort: true,
        threshold: 0.99,
        include: ["score"]
      }
      var fuse = new Fuse(set, options)
      var matches = yield fuse.search(input);
      var candidate;
      if (matches && matches.length > 0 && matches[0].item.name.match(/\d+/g) && matches[0].item.name.match(/\d+/g).length > 0) {
        unit_candidate = matches[0].item.name;
        unit_number = unit_candidate.match(/\d+/g)[0];
        unit_type = unit_candidate.split(unit_number)[1] ? unit_candidate.split(unit_number)[1] : unit_candidate.split(unit_number)[0];
        var types = ['fl','apt','attn','unit','floor','apartment','attention']
        var fuse2 = new Fuse(set, options)
        var type_matches = []
        yield types.map(function * (type) {
          var res = yield fuse2.search(type);
          res = res.map((e) => { 
            e.type = type;
            return e;
             });
          type_matches = type_matches.concat(res)
        })
        type_matches.sort(function(a, b) {
          return a.score - b.score;
        });
        unit_type = type_matches[0].type;
      }
        var final = input.replace(unit_type,'').replace(unit_number,'')
        final = final.replace(/\s\s+/g, ' ');
        return final
    }
  }

module.exports = {
  parseAddress: parseAddress,
  cleanAddress: cleanAddress
}