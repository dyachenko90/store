export default class Card {
    constructor(productData) {
      this.state = productData;
      this.render();
      this.initEventListeners();
    }
  
    getTemplate () {
      return `
        <div class="card">
          <div class="card__content">
            <img src="${this.state.images[0]}" class="card__image">
            <div class="card__info">
              <div class="info-header">
                <button class="info-raiting card__button">
                  <span>${this.state.rating}</span>
                  <svg width="14" height="12" viewBox="0 0 14 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 0.940965L8.8394 3.87345L8.95364 4.05557L9.16441 4.09795L12.6648 4.80181L10.3013 7.25805L10.1392 7.42652L10.1645 7.65893L10.5264 10.9777L7.18936 9.61224L7 9.53476L6.81064 9.61224L3.47361 10.9777L3.83549 7.65893L3.86083 7.42652L3.69872 7.25805L1.3352 4.80181L4.83559 4.09795L5.04636 4.05557L5.1606 3.87345L7 0.940965Z" stroke="white"/>
                  </svg>
                </button>
                <span class="info-price">${this.state.price}</span>
              </div>
              <div class="info-title">${this.state.title}</div>
              <div class="info-category">${this.state.category}</div>
            </div>
          </div>
          <button class="card__action-button card__button" data-element="addToCart">Add To Cart</button>
        </div>
      `;
    }
  
    render () {
      const wrapper = document.createElement('div');
      wrapper.innerHTML = this.getTemplate();
      this.element = wrapper.firstElementChild;
    }
  
    update (data = {}) {
      this.state = data;
      this.element.innerHTML = this.getTemplate();
    }
  
    initEventListeners () {
      const addToCartBtn = this.element.querySelector('[data-element="addToCart"]');
      addToCartBtn.addEventListener('click', event => {
        this.dispatchAddToCartEvent(this.state);
      });
    }
  
    dispatchAddToCartEvent (productData) {
      this.element.dispatchEvent(new CustomEvent('add-to-cart', {
        detail: productData,
        bubbles: true
      }));
    }
  }