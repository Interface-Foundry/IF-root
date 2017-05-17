export const getSearchHistory = (filter) => {
  if (!localStorage.searchHistory) return [];

  return localStorage.searchHistory.split('-')
    .filter((pSearch) => pSearch.includes(filter)).reverse();
};

export const getLastSearch = () => {
	if (!localStorage.searchHistory) return [];

  return localStorage.searchHistory.split('-').reverse()[0];
}

export const addSearchHistory = term => {
	if(localStorage.searchHistory) {
		if(!localStorage.searchHistory.includes(term)) {
			localStorage.searchHistory = localStorage.searchHistory + `-${term}`;
		} else if (localStorage.searchHistory.includes(`-${term}-`)) { 
			localStorage.searchHistory = localStorage.searchHistory.replace(`-${term}-`, '')
			localStorage.searchHistory = localStorage.searchHistory + `-${term}`;
		} else if (localStorage.searchHistory.includes(`${term}-`)) { 
			localStorage.searchHistory = localStorage.searchHistory.replace(`${term}-`, '')
			localStorage.searchHistory = localStorage.searchHistory + `-${term}`;
		}
	} else {
		localStorage.searchHistory = term;
	}
};
