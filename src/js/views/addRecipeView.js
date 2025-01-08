import icons from 'url:../../img/icons.svg';
import View from './View';

class AddRecipeView extends View {
  _parentEl = document.querySelector('.upload');
  _message = 'Recipe was successfully uploaded';

  _window = document.querySelector('.add-recipe-window');
  _overlay = document.querySelector('.overlay');
  _btnOpen = document.querySelector('.nav__btn--add-recipe');
  _btnClose = document.querySelector('.btn--close-modal');

  constructor(){
    super();
    this._addHandlerShowCloseWindow();
  }

  toogleWindow() {
    this._overlay.classList.toggle('hidden');
    this._window.classList.toggle('hidden');
  }

  _addHandlerShowCloseWindow(){
    this._btnOpen.addEventListener('click', this.toogleWindow.bind(this));
    this._btnClose.addEventListener('click', this.toogleWindow.bind(this));
  }

  addHandlerUpload(handler) {
    this._parentEl.addEventListener('submit', function(e){
        e.preventDefault();
        const data = Object.fromEntries([...new FormData(this)]);
        handler(data);
    });
  }

  _generateMarkup() {

  }

}

export default new AddRecipeView();
