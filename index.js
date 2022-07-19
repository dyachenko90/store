import CardsList from "./components/cards-list/index.js";
import Pagination from './components/pagination/index.js';
import SearchBox from './components/search-box/index.js';
import SideBar from './components/side-bar/index.js';
import Cart from './components/cart/index.js';

const BACKEND_URL = 'https://online-store.bootcamp.place/api/'

export default class OnlineStorePage {
  constructor () {
    this.components = {}
    this.products = []
    this.cartProducts = []
    this.totalElements = 100
    this.filters = {
      _page: 1,
      _limit: 9,
      q: ''
    }
    this.filtersPanel = ''

    this.url = new URL('products', BACKEND_URL)

    this.initComponents()
    this.render()
    this.renderComponents()
    this.initEventListeners()

    this.update('_page', 1)
  }

  async loadData () {
    for (const key in this.filters) {
      if (this.filters[key]) {
        this.url.searchParams.set(key, this.filters[key])
      } else {
        this.url.searchParams.delete(key, this.filters[key])
      }
    }

    const response = await fetch(this.url + this.filtersPanel);

    this.totalElements = Number(response.headers.get('X-Total-Count'))
    const totalPages = Math.ceil(this.totalElements / this.filters._limit)

    const products = await response.json();
    return { products, totalPages };
  }

  getTemplate () {
    return `
      <div class="page" data-element="page">
        <div class="page-wrapper">
          <header class="os-header">
            <span class="os-page-title">E-Store</span>
            
            <button class="os-btn os-cart-btn" data-element="cartBtn">
              <i class="bi bi-cart"></i>
              <div class="os-cart-title"> Cart<span data-element="cartQuantity"></span></div>
            </button>
          </header>
          <main class="main-container">
            <aside class="os-sidebar-container" data-element="sideBar">
            </aside>
            <section>
              <div data-element="searchBox">
              </div>
              <div data-element="cardsList">
              </div>
              <div class="os-pagination-container" data-element="pagination">
              </div>
            </section>
          </main>
        </div>
      </div>      
    `;
  }

  initComponents () {
    const totalPages = Math.ceil(this.totalElements / this.filters._limit)

    const cardsList = new CardsList(this.products)
    const pagination = new Pagination({
      activePageIndex: 0,
      totalPages
    })
    const searchBox = new SearchBox()
    const sideBar = new SideBar()
    const cart = new Cart()

    this.components.cardsList = cardsList
    this.components.pagination = pagination
    this.components.searchBox = searchBox
    this.components.sideBar = sideBar
    this.components.cart = cart
  }

  render () {
    const wrapper = document.createElement('div')

    wrapper.innerHTML = this.getTemplate()

    this.element = wrapper.firstElementChild
  }

  renderComponents () {
    const cardsContainer = this.element.querySelector('[data-element="cardsList"]')
    const paginationContainer = this.element.querySelector('[data-element="pagination"]')
    const searchBoxContainer = this.element.querySelector('[data-element="searchBox"]')
    const sideBarContainer = this.element.querySelector('[data-element="sideBar"]')

    cardsContainer.append(this.components.cardsList.element)
    paginationContainer.append(this.components.pagination.element)
    searchBoxContainer.append(this.components.searchBox.element)
    sideBarContainer.append(this.components.sideBar.element)

    this.element.appendChild(this.components.cart.element)
  }

  initEventListeners () {
    this.components.pagination.element.addEventListener('page-changed', event => {
      const pageIndex = Number(event.detail);

      this.update('_page', pageIndex + 1);
    })

    this.components.searchBox.element.addEventListener('search-changed', event => {
      const searchQuery = event.detail;

      this.update('q', searchQuery);
    })

    this.components.sideBar.element.addEventListener('filters-changed', event => {
      const filtersArr = event.detail;

      this.filtersPanel = filtersArr.length ? '&' + filtersArr.join('&') : '';
      this.update('q');
    })

    this.components.sideBar.element.addEventListener('filters-reset', event => {
      this.filtersPanel = '';
      this.components.searchBox.reset();
      this.filters.q = '';
      this.update('q');
    })

    const cartBtn = this.element.querySelector('[data-element="cartBtn"]');
    cartBtn.addEventListener('click', event => {
      this.components.cart.open();
    })

    this.components.cardsList.element.addEventListener('add-to-cart', event => {
      this.addProductToCart(event.detail);
    })

    this.components.cart.element.addEventListener('decrement-cart-product', event => {
      this.decrementCartProduct(event.detail);
    })

    this.components.cart.element.addEventListener('increment-cart-product', event => {
      this.incrementCartProduct(event.detail);
    })
  }

  decrementCartProduct (id) {
    const cartItem = this.cartProducts.find((item) => item.id === id);
    if (cartItem.quantity > 1) {
      cartItem.quantity--;
    } else {
      const idx = this.cartProducts.findIndex((item) => item.id === id);
      this.cartProducts.splice(idx, 1);
    }
    this.updateCartData();
  }

  incrementCartProduct (id) {
    const cartItem = this.cartProducts.find((item) => item.id === id);
    cartItem.quantity++;
    this.updateCartData();
  }

  addProductToCart (product) {
    const cartItem = this.cartProducts.find(item => item.id === product.id)
    if (cartItem) {
      cartItem.quantity += 1;
    } else {
      product.quantity = 1;
      this.cartProducts.push(product);
    }
    this.updateCartData();
  }

  updateCartData () {
    const totalQuantity = this.getTotalQuantity(this.cartProducts);
    this.element.querySelector('[data-element="cartQuantity"]').innerHTML = totalQuantity;
    this.components.cart.update(this.cartProducts);
  }

  getTotalQuantity (products) {
    if (!products.length) return '';
    return products.reduce((acc, cur) => {
      return acc + cur.quantity;
    }, 0);
  }

  async update (filterName, filtervalue) {
    if (filterName && (typeof filtervalue === 'number' || typeof filtervalue === 'string')) {
      this.filters[filterName] = filtervalue;
    }
    if (filterName === 'q') this.filters._page = 1;

    const { products, totalPages } = await this.loadData();

    if (filterName === '_page') {
      this.components.cardsList.update(products);
    }
    if (filterName === 'q') {
      this.components.pagination.update(totalPages);
      this.components.cardsList.update(products);
    }
  }
}
