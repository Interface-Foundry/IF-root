var sets = [];


//*Increasing proxy counts

// SETUP 0
var setup0 = { 
     id: 0,
     time_in_seconds: 3600,
     config:{
      customer: 'kipthis', 
      password: 'e49d4ega1696', 
      zone: 'gen'
      // max_requests: 20,
      // country: 'us',
      // log: 'NONE'
    }
};

sets.push(setup0);


// SETUP 1 
var setup1 = {
    id: 1,
    time_in_seconds: 3600,
    config: {
        customer: 'kipthis', 
        password: 'e49d4ega1696', 
        zone: 'gen', 
        proxy_count: 3, 
        max_requests: 5
    }
};

sets.push(setup1);

// SETUP 2
var setup2 = {
    id: 2,
    time_in_seconds: 3600,
    config: {
        customer: 'kipthis', 
        password: 'e49d4ega1696', 
        zone: 'gen', 
        proxy_count: 5, 
        max_requests: 5
    }
};

sets.push(setup2);

// SETUP 3
var setup3 = {
    id: 3,
    time_in_seconds: 3600,
    config: {
        customer: 'kipthis', 
        password: 'e49d4ega1696', 
        zone: 'gen', 
        proxy_count: 7, 
        max_requests: 5
    }
};

sets.push(setup3);

// SETUP 4
var setup4 = {
    id: 5,
    time_in_seconds: 3600,
    config: {
        customer: 'kipthis', 
        password: 'e49d4ega1696', 
        zone: 'gen', 
        proxy_count: 10, 
        max_requests: 5
    }
};

sets.push(setup4);

// SETUP 5
var setup5 = {
    id: 5,
    time_in_seconds: 3600,
    config: {
        customer: 'kipthis', 
        password: 'e49d4ega1696', 
        zone: 'gen', 
        proxy_count: 15, 
        max_requests: 5
    }
};

sets.push(setup5);

// SETUP 6
var setup6 = {
    id: 6,
    time_in_seconds: 3600,
    config: {
        customer: 'kipthis', 
        password: 'e49d4ega1696', 
        zone: 'gen', 
        proxy_count: 20, 
        max_requests: 5
    }
};

sets.push(setup6);

// SETUP 7
var setup7 = {
    id: 7,
    config: {
        customer: 'kipthis', 
        password: 'e49d4ega1696', 
        zone: 'gen', 
        proxy_count: 25, 
        max_requests: 5
    }
};

sets.push(setup7);

//*Max Requests

// SETUP 8
var setup8 = {
    id: 8,
    time_in_seconds: 2700,
    config: {
        customer: 'kipthis', 
        password: 'e49d4ega1696', 
        zone: 'gen', 
        proxy_count: 3, 
        max_requests: 1
    }
};

sets.push(setup8);


// SETUP 9
var setup9 = {
    id: 9,
    time_in_seconds: 2700,
    config: {
        customer: 'kipthis', 
        password: 'e49d4ega1696', 
        zone: 'gen', 
        proxy_count: 3, 
        max_requests: 5
    }
};

sets.push(setup9);


// SETUP 10
var setup10 = {
    id: 10,
    time_in_seconds: 2700,
    config: {
        customer: 'kipthis', 
        password: 'e49d4ega1696', 
        zone: 'gen', 
        proxy_count: 3, 
        max_requests: 10
    }
};

sets.push(setup10);


// SETUP 10
var setup11 = {
    id: 11,
    time_in_seconds: 2700,
    config: {
        customer: 'kipthis', 
        password: 'e49d4ega1696', 
        zone: 'gen', 
        proxy_count: 3, 
        max_requests: 15
    }
};

sets.push(setup11);

// SETUP 11 
var setup12 = {
    id: 12,
    time_in_seconds: 2700,
    config: {
        customer: 'kipthis', 
        password: 'e49d4ega1696', 
        zone: 'gen', 
        proxy_count: 3, 
        max_requests: 20,
        country: 'us'
    }
};

sets.push(setup12);


// SETUP 13 - ZONE US
var setup13 = {
    id: 13,
    time_in_seconds: 7200,
    config: {
        customer: 'kipthis', 
        password: 'e49d4ega1696', 
        zone: 'gen', 
        proxy_count: 3, 
        max_requests: 5,
        country: 'us',
    }
};

sets.push(setup13);

// SETUP 14 - Proxy Switch on
var setup14 = {
    id: 14,
    time_in_seconds: 7200,
    config: {
        customer: 'kipthis', 
        password: 'e49d4ega1696', 
        zone: 'gen', 
        proxy_count: 3, 
        max_requests: 5,
        proxy_switch:true
    }
};

sets.push(setup14);

// SETUP 15 - Request timeout set (2sec)
var setup15 = {
    id: 15,
    time_in_seconds: 2700,
    config: {
        customer: 'kipthis', 
        password: 'e49d4ega1696', 
        zone: 'gen', 
        proxy_count: 3, 
        max_requests: 5,
        request_timeout: 2
    }
};

sets.push(setup15);

// SETUP 16 - Request timeout set (5sec)
var setup16 = {
    id: 16,
    time_in_seconds: 2700,
    config: {
        customer: 'kipthis', 
        password: 'e49d4ega1696', 
        zone: 'gen', 
        proxy_count: 3, 
        max_requests: 5,
        request_timeout: 5
    }
};

sets.push(setup16);

// SETUP 17 - Request timeout set (10sec)
var setup17 = {
    id: 17,
    time_in_seconds: 2700,
    config: {
        customer: 'kipthis', 
        password: 'e49d4ega1696', 
        zone: 'gen', 
        proxy_count: 3, 
        max_requests: 5,
        request_timeout: 10
    }
};

sets.push(setup17);

// SETUP 18 - Session timeout (2000)
var setup18 = {
    id: 18,
    time_in_seconds: 2700,
    config: {
        customer: 'kipthis', 
        password: 'e49d4ega1696', 
        zone: 'gen', 
        proxy_count: 3, 
        max_requests: 5,
        session_timeout: 2000
    }
};

sets.push(setup18);

// SETUP 19 - Session timeout (5000)
var setup19 = {
    id: 19,
    time_in_seconds: 2700,
    config: {
        customer: 'kipthis', 
        password: 'e49d4ega1696', 
        zone: 'gen', 
        proxy_count: 3, 
        max_requests: 5,
        session_timeout: 5000
    }
};

sets.push(setup19);

// SETUP 20 - Session timeout (10000)
var setup20 = {
    id: 20,
    time_in_seconds: 2700,
    config: {
        customer: 'kipthis', 
        password: 'e49d4ega1696', 
        zone: 'gen', 
        proxy_count: 3, 
        max_requests: 5,
        session_timeout: 10000
    }
};

sets.push(setup20);

// SETUP 21 - Session timeout (20000)
var setup21 = {
    id: 21,
    time_in_seconds: 2700,
    config: {
        customer: 'kipthis', 
        password: 'e49d4ega1696', 
        zone: 'gen', 
        proxy_count: 3, 
        max_requests: 5,
        session_timeout: 20,
        session_timeout: 20000
    }
};

sets.push(setup21);


// SETUP 22 - Session timeout (60000)
var setup22 = {
    id: 22,
    time_in_seconds: 2700,
    config: {
        customer: 'kipthis', 
        password: 'e49d4ega1696', 
        zone: 'gen', 
        proxy_count: 3, 
        max_requests: 5,
        session_timeout: 60000
    }
};

sets.push(setup22);

// SETUP 23 - pool size (2)
var setup23 = {
    id: 23,
    time_in_seconds: 2700,
    config: {
        customer: 'kipthis', 
        password: 'e49d4ega1696', 
        zone: 'gen', 
        proxy_count: 3, 
        max_requests: 5,
        pool_size: 2
    }
};

sets.push(setup23);

// SETUP 24 - pool size (5)
var setup24 = {
    id: 24,
    time_in_seconds: 2700,
    config: {
        customer: 'kipthis', 
        password: 'e49d4ega1696', 
        zone: 'gen', 
        proxy_count: 3, 
        max_requests: 5,
        pool_size: 5
    }
};

sets.push(setup24);

// SETUP 25 - pool size (10)
var setup25 = {
    id: 25,
    time_in_seconds: 2700,
    config: {
        customer: 'kipthis', 
        password: 'e49d4ega1696', 
        zone: 'gen', 
        proxy_count: 3, 
        max_requests: 5,
        pool_size: 10
    }
};

sets.push(setup25);

// SETUP 26 - pool size (15)
var setup26 = {
    id: 26,
    time_in_seconds: 2700,
    config: {
        customer: 'kipthis', 
        password: 'e49d4ega1696', 
        zone: 'gen', 
        proxy_count: 3, 
        max_requests: 5,
        pool_size: 15
    }
};

sets.push(setup26);


// SETUP 27 - Sticky IP 
var setup27 = {
    id: 27,
    time_in_seconds: 7200,
    config: {
        customer: 'kipthis', 
        password: 'e49d4ega1696', 
        zone: 'gen', 
        proxy_count: 3, 
        max_requests: 5,
        sticky_ip: true
    }
};

sets.push(setup26);


// SETUP 28 - Secure Proxy 
var setup28 = {
    id: 28,
    time_in_seconds: 7200,
    config: {
        customer: 'kipthis', 
        password: 'e49d4ega1696', 
        zone: 'gen', 
        proxy_count: 3, 
        max_requests: 5,
        secure_proxy: true
    }
};

//THIS IS THE BASE SETUP, GOING TO TEST THIS ONE FOR A FULL 24 HRS
var setup29 = {
    id: 29,
    time_in_seconds: 86400,
    config: {
        customer: 'kipthis', 
        password: 'e49d4ega1696', 
        zone: 'gen', 
    }
};

sets.push(setup29);

var current_set = 0;

module.exports = {sets: sets, current_set: current_set };

