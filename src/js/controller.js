import * as model from "./model.js";
import recipeView from "./views/recipeView.js";
import searchView from "./views/searchView.js";
import resultsView from "./views/resultsView.js";
import paginationView from "./views/paginationViews.js";
import bookmarksView from "./views/bookmarksView.js";
import addRecipeView from "./views/addRecipeView.js";
import { MODAL_CLOSE_SEC } from "./config.js";

import "core-js/stable";
import "regenerator-runtime/runtime";

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

// if (module.hot) {
//   module.hot.accept();
// }

const controlServings = function (newServings) {
  //update servings in state
  model.updateServings(newServings);

  //update UI with new state
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);

}

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);
    if (!id) return;
    recipeView.renderSpinner();

    // 0. update results view to mark selected search results
    resultsView.update(model.getSearchResultsPage());

    // 1. Updating Bookmarks View
    bookmarksView.update(model.state.bookmarks);

    // 2.importing recipe
    await model.loadRecipe(id);

    // 3. rendering recipe
    recipeView.render(model.state.recipe);

  }
  catch (err) {
    recipeView.renderError();
  }
}

const controlSearchResults = async function () {
  try {

    resultsView.renderSpinner();
    // console.log(resultsView);
    //1. get Search Query
    const query = searchView.getQuery();
    if (!query) return;

    //2. load search results 
    await model.loadSearchResults(query);

    //3. render results
    // console.log(model.state.search.results);
    // resultsView.render(model.state.search.results);
    resultsView.render(model.getSearchResultsPage());

    //4. Render initial pagination buttons
    paginationView.render(model.state.search);

  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (goToPage) {
  //3. render NEW results
  resultsView.render(model.getSearchResultsPage(goToPage));

  //4. Render NEW pagination buttons
  paginationView.render(model.state.search);
};

const controlAddBookmark = function () {
  // 1. add/remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);
  //2. update recipe view
  recipeView.update(model.state.recipe);
  //3. render bookmark
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    // console.log(newRecipe);
    //render spinner
    addRecipeView.renderSpinner();

    //upload the new recipe data
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);
    //render recipe
    recipeView.render(model.state.recipe);
    // success message
    addRecipeView.renderMessage();
    // render bookmark view
    bookmarksView.render(model.state.bookmarks);
    //change id in the URL
    window.history.pushState(null, "", `#${model.state.recipe.id}`)
    //close upload window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error("💥💥💥", err);
    addRecipeView.renderError(err.message);
  }
}

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
}
init();
