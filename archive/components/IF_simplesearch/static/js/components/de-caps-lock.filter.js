simpleSearchApp.filter('deCapslock', [function() {
    return function(input) {
        input = input.toLowerCase();
        var reg = /\s((a[lkzr])|(c[aot])|(d[ec])|(fl)|(ga)|(hi)|(i[dlna])|(k[sy])|(la)|(m[edainsot])|(n[evhjmycd])|(o[hkr])|(pa)|(ri)|(s[cd])|(t[nx])|(ut)|(v[ta])|(w[aviy]))$/;
        var state = input.match(reg);
        if (state !== null) {
            state = state[0].toUpperCase();
            input = input.replace(reg, state);
        }
        return input;
    };
}]);