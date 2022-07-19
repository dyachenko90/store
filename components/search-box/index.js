export default class SearchBox {
  constructor() {
    this.searchValue = '';

    this.render();
    this.addListeners();
  }

  getTemplate () {
    return `
      <label class="searchbox">
        <input
          id="search-input"
          data-element="search"
          value="${this.searchValue}"
          type="text"
          class="searchbox__input"
          placeholder="Search"
        >
        <i class="bi bi-search searchbox__icon"></i>
      </label>
    `;
  }

  render () {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;
  }

  addListeners () {
    const searchInput = this.element.querySelector('[data-element="search"]')

    searchInput.addEventListener('input', event => {
      this.searchValue = event.target.value.trim();

      this.dispatchSearchChangeEvent();
    })
  }

  dispatchSearchChangeEvent = () => {
    const customEvent = new CustomEvent('search-changed', {
      detail: this.searchValue
    })

    this.element.dispatchEvent(customEvent);
  }

  reset () {
    const searchInput = this.element.querySelector('[data-element="search"]');
    searchInput.value = '';
    this.searchValue = '';
  }
}