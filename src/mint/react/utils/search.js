// Example markov (probablity) search
// store markov search in local storage
// To 
// let terminals = {},
// 	startwords = [],
// 	wordstats = {};

// for (let i = 0; i < titles.length; i++) {
//     const words = titles[i].split(' ');
//     terminals[words[words.length-1]] = true;
//     startwords.push(words[0]);
//     for (var j = 0; j < words.length - 1; j++) {
//         if (wordstats.hasOwnProperty(words[j])) {
//             wordstats[words[j]].push(words[j+1]);
//         } else {
//             wordstats[words[j]] = [words[j+1]];
//         }
//     }
// }

// const choice = function (a) {
//     const i = Math.floor(a.length * Math.random());
//     return a[i];
// };

// const make_title = function (min_length) {
//     word = choice(startwords);
//     let title = [word];
//     while (wordstats.hasOwnProperty(word)) {
//         const next_words = wordstats[word];
//         word = choice(next_words);
//         title.push(word);
//         if (title.length > min_length && terminals.hasOwnProperty(word)) break;
//     }
//     if (title.length < min_length) return make_title(min_length);
//     return title.join(' ');
// };

// if you have searchs, you just show past searchs.
// autocorrect
// Should return [] of previous search terms

export const getSearchHistory = (filter) => {
	if (!localStorage.searchHistory) return []

	return _.filter(localStorage.searchHistory.split(','), (pSearch) => pSearch.includes(filter))
};

export const addSearchHistory = term => {
	localStorage.searchHistory = localStorage.searchHistory ? localStorage.searchHistory + `,${term}` : term;
}






