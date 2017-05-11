
export const getSearchHistory = (filter) => {
  if (!localStorage.searchHistory) return [];

  return localStorage.searchHistory.split(',')
    .filter((pSearch) => pSearch.includes(filter));
};

export const getLastSearch = () => {
	if (!localStorage.searchHistory) return [];

  return localStorage.searchHistory.split(',').reverse()[0];
}

export const addSearchHistory = term => {
  localStorage.searchHistory = localStorage.searchHistory ? localStorage.searchHistory + `,${term}` : term;
};
