
const items = [
	{
		imgSrc: 'https://gamefaqs.akamaized.net/box/3/8/6/422386_thumb.jpg',
		searchTerm: 'Diablo',
		name: 'Diablo III',
		price: 40,
		oldPrice: 60,
		ratings: 5,
		id: 1
	},
	{
		imgSrc: 'https://cdn.shopify.com/s/files/1/1228/7500/products/9723-2_small.jpg?v=1490077169',
		searchTerm: 'Laptops',
		name: 'Macbook Pro',
		price: 140,
		oldPrice: 200,
		ratings: 5,
		id: 2
	},
	{
		imgSrc: 'http://i73.photobucket.com/albums/i224/Asiya_J/icons/23.gif',
		searchTerm: 'Sushi',
		name: 'California Roll',
		price: 12,
		oldPrice: 14,
		ratings: 5,
		id: 3
	},
	{
		imgSrc: 'https://screenshots.en.sftcdn.net/en/scrn/333000/333602/thumbnail_1377441037-100x100.png',
		searchTerm: 'Notebooks',
		name: 'Memo Book',
		price: 5,
		oldPrice: 8,
		ratings: 5,
		id: 4
	},
	{
		imgSrc: 'http://i5.walmartimages.com/dfw/dce07b8c-164f/k2-_c930b35d-f07b-493b-8f51-56a38acf5288.v1.jpg',
		searchTerm: 'Snacks',
		name: 'Hi-Chew',
		price: 3,
		oldPrice: 4,
		ratings: 5,
		id: 5
	}
]

const initialState = {
	items: items
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
  	case 'ITEM_SHUFFLE':
  		return {
  			...state,
  			items: [..._.filter(state.items, (i) => i.id !== state.items[0].id), state.items[0]]
  		}
    default:
      	return state;
  }
}
