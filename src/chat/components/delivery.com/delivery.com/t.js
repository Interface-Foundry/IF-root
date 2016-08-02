a = [12, 42, 53, 52]
a.reduce((m, v, i) => {
	console.log(m, v, i);
	return m + v;
}, 0)
