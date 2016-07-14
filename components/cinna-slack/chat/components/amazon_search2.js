var amazon = require('amazon-product-api');


var locale_map = {
    en_US : '.com',
    fr_CA: '.ca',
    en_UK : '.co.uk',
    french: {
        regexes: [
        /^_FR/,
        /^BR/
        ],
        domain: '.fr'// 3 possible
    }
}
    ja_/ : '.co.jp', // 2 possible
    /^_IT: '.it', // 2 possible
    pt_BR: '.com.br',
    *_DE: '.de', // 2 possible
    *_IN: '.in', // 13 possible
    es_MX: '.com.mx',
    nl_NL: '.nl',
    *_ES: '.es', // 4 possible
}

/*
query will look like:
{
  "first_name": "Mitsuaki",
  "last_name": "Moto",
  "profile_pic": "https://scontent.xx.fbcdn.net/v/t1.0-1/p200x200/12417988_10105968967877409_8398549461121350987_n.jpg?oh=57eb9e5b2f2573d910ed90b61691b03b&oe=57F2454E",
  "locale": "en_US",
  "timezone": -4,
  "gender": "male"
}
*/

var aws_clients = {
  AKIAIKMXJTAV2ORZMWMQ: amazon.createClient({
    awsId: "AKIAIKMXJTAV2ORZMWMQ",
    awsSecret: "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",
    awsTag: "quic0b-20"
  }),
  AKIAIM4IKQAE2WF4MJUQ: amazon.createClient({
    awsId: "AKIAIM4IKQAE2WF4MJUQ",
    awsSecret: "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",
    awsTag: "quic0b-20"
  })
};

var DEFAULT_CLIENT = 'AKIAIKMXJTAV2ORZMWMQ';

var aws_client_id_list = Object.keys(aws_clients);

var i = 0;
function get_client() {
  i++;
  if (i === aws_client_id_list.length) {
    i = 0;
  }
  return aws_clients[aws_client_id_list[i]];
}

