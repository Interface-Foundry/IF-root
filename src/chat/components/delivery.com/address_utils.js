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
    var reg_res = yield extractUnit(location.input)
    var fuz_res = yield extractUnitFuzzy(location.input)
    // kip.debug('reg_res: ', reg_res, 'fuz_res: ', fuz_res)
    address.unit_type = reg_res.unit_type ? reg_res.unit_type : (fuz_res.unit_type && (parsed.street && fuz_res.unit_type.indexOf(parsed.street) == -1) ? fuz_res.unit_type : '');
    if (!reg_res.unit_number) {
      address.unit_number = fuz_res.unit_number
    } 
  }

  return address;

}

/*
* when passing something like "902 broadway, apt 5, ny" into api.searchNearby delivery.com api craps out. this fill fix that
*/
function * cleanAddress(input) {
  var final = '';
  var slength = input.length;
  var parsed = parse_address.parseLocation(input);
  var set;
  set = input.split(',')
  set = set.map((r) => { return { name: r }})
  if (set.length <= 2) {
     set = input.split(' ')
     set = set.map((r) => { return { name: r }})
  }
  var reg_res = yield extractUnit(input)
  var fuz_res = yield extractUnitFuzzy(input, set)
  var unit_type = reg_res.unit_type ? reg_res.unit_type : (fuz_res.unit_type && (parsed.street && fuz_res.unit_type.indexOf(parsed.street) == -1) ? fuz_res.unit_type : '');
  var unit_number = reg_res.unit_number ? reg_res.unit_number : (fuz_res.unit_number && (parsed.street && parsed.number && fuz_res.unit_number.indexOf(parsed.street) == -1 && fuz_res.unit_number.indexOf(parsed.number) == -1) ? fuz_res.unit_type : '');
  if (!unit_number) {
    var index;
    set.map((r, i) => {
      if (r.name.indexOf(unit_type) > -1) {
        index = i;
      }
    })
    set.splice(index,1)
    set.forEach( function(r) {  if (r && r.name) final = final + (' ' + r.name) } )
  } 
  else {
    final = input.replace(unit_type,'').replace(unit_number,'')
  }

  return final

}

function * extractUnit(input) {
  var parsed = parse_address.parseLocation(input);
  var unit_type = parsed.sec_unit_type ? parsed.sec_unit_type : '';
  var unit_number = parsed.sec_unit_number ? parsed.sec_unit_number : '';
  return { unit_type: unit_type, unit_number: unit_number }
}


function * extractUnitFuzzy(input, set) {
  var unit_candidate;
  var unit_number;
  var unit_type;
  var options = {
    keys: [{ name: 'name', weight: 1}],
    shouldSort: true,
    threshold: 0.99,
    include: ["score"]
  }
  if (!set) {
    var set = input.split(',')
    set = set.map((r) => { return { name: r }})
    if (set.length <= 2) {
       set = input.split(' ')
       set = set.map((r) => { return { name: r }})
    }
  }
  var fuse = new Fuse(set, options);
  var types = ['floor','apt','attn','unit','apartment','attention']
  var type_matches = []
  yield types.map(function * (type) {
    var res = yield fuse.search(type);
    res = res.map((e) => { 
      e.type = type;
      return e;
       });
    type_matches = type_matches.concat(res)
  })
  type_matches.sort(function(a, b) {
    return a.score - b.score;
  });
  unit_type = type_matches[0] ? type_matches[0].type : '';
  var type_orig = type_matches[0].item.name;
  var index;
  set.map((r, i) => {
    if (r.name.indexOf(type_orig) > -1) {
      index = i;
    }
  })
  unit_number = set[index].name.replace(unit_type,'');

  return { unit_type: unit_type, unit_number: unit_number }
}



module.exports = {
  parseAddress: parseAddress,
  cleanAddress: cleanAddress,
  extractUnit: extractUnit,
  extractUnitFuzzy: extractUnitFuzzy,
}