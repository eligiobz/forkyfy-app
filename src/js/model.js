import { API_URL, API_KEY, RES_PER_PAGE } from './config';
import { AJAX } from './helpers';

export const state = {
  recipe: {},
  search: {
    query: '',
    results: [],
    resultsPerPage: RES_PER_PAGE,
    page: 1,
  },
  bookmarks: [],
};

const createRecipeObject = function(data) {
  const { recipe } = data.data;

    return {
      id: recipe.id,
      title: recipe.title,
      publisher: recipe.publisher,
      sourceUrl: recipe.source_url,
      image: recipe.image_url,
      servings: recipe.servings,
      cookingTime: recipe.cooking_time,
      ingredients: recipe.ingredients,
      ...(recipe.key && {key: recipe.key})
    };

}

export const loadRecipe = async function (id) {
  try {
    const data = await AJAX(`${API_URL}/${id}?key${API_KEY}`);

    state.recipe = createRecipeObject(data)

    state.recipe.bookmarked = state.bookmarks.some(b => b.id === id) ? true : false;

  } catch (err) {
    throw err;
  }
};

export const loadSearchResults = async function (query) {
  try {
    state.search.query = query;
    const data = await AJAX(`${API_URL}?search=${query}&key=${API_KEY}`);
    state.search.results = data.data.recipes.map(rec => {
      return {
        id: rec.id,
        title: rec.title,
        publisher: rec.publisher,
        image: rec.image_url,
        ...(rec.key && {key: rec.key})
      };
    });
    state.search.page = 1;
  } catch (err) {
    throw err;
  }
};

export const getSearchResultsPage = function (page = state.search.page) {
  state.search.page = page;
  const start = (page - 1) * state.search.resultsPerPage;
  const end = page * state.search.resultsPerPage;
  return state.search.results.slice(start, end);
}

export const updateServings = function (newServings) {
  console.log(`state recipe`, state);
  state.recipe.ingredients.forEach(ing => {
    ing.quantity = (ing.quantity * newServings / state.recipe.servings)
  });
  state.recipe.servings = newServings;
}

const persistBookmarks = function() {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
}

export const addBookmark = function (recipe) {
  // Add bookmark
  state.bookmarks.push(recipe);

  // Mark current recipe as bookmarked
  if (recipe.id === state.recipe.id) {
    state.recipe.bookmarked = true;
  }

  persistBookmarks();
}

export const deleteBookmark = function (id) {
  const index = state.bookmarks.findIndex(el => el.id === id)
  state.bookmarks.splice(index, 1);

  // Mark current recipe as bookmarked
  if (id === state.recipe.id) {
    state.recipe.bookmarked = false;
  }
  persistBookmarks();
}

export const uploadRecipe = async function(newRecipe) {
  try {
    const ingredients = Object.entries(newRecipe)
    .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
    .map(ing => {
      const ingArr = ing[1].replaceAll(' ','').split(',');
      if (ingArr.length !== 3) throw new Error('Wrong ingredient format! Please use the correct format');
      const [quantity, unit, description] = ingArr;
      return {
        quantity: quantity ? Number(quantity) : null,
        unit,
        description
      } 
    });
    
    const recipe = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      cooking_time: +newRecipe.cookingTime,
      servings: +newRecipe.servings,
      ingredients
    }
    const data = await AJAX(`${API_URL}?key=${API_KEY}`, recipe);
    state.recipe = createRecipeObject(data)
    addBookmark(state.recipe);
    
  } catch (err) {
    throw err;
  }

}

const init = function () {
    const storage = localStorage.getItem('bookmarks', JSON.stringify());
    if (storage) {
      state.bookmarks = JSON.parse(storage);
    }
}

init();