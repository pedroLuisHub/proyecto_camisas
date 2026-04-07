

// Database
const sizesKids = ["2", "4", "6", "8", "10", "12", "14", "16"];
const sizesAdults = ["P", "M", "G", "GG"];

const countries = [
  {
    name: "Paraguay", color: "D30026", text: "ffffff", adultoPremiumImgPy: "/images/cam_py_premium.jpg",
    kidsPremiumImgPy: "/images/conjunto_premium_py.png", imagenTest: "/images/imagen_test.jpeg"
  },
  { name: "Argentina", color: "75aadb", text: "ffffff" },
  { name: "Brasil", color: "fedd00", text: "009b3a" },
  { name: "Portugal", color: "E32636", text: "ffffff" }
];

let products = [];
let idCounter = 1;

countries.forEach(c => {
  // Adulto Premium
  products.push({
    id: idCounter++,
    name: `${c.name} Premium Adulto`,
    price: 120000,
    image: c.adultoPremiumImgPy || `https://placehold.co/600x800/${c.color}/${c.text}?text=${c.name}+Premium`,
    sizes: sizesAdults,
    country: c.name,
    badge: "Premium Quality"
  });
  // Kids Conjunto Premium
  products.push({
    id: idCounter++,
    name: `Conjunto Premium Kids ${c.name}`,
    price: 120000,
    image: c.kidsPremiumImgPy || `https://placehold.co/600x800/${c.color}/${c.text}?text=Conj.+${c.name}+Kids`,
    sizes: sizesKids,
    country: c.name,
    badge: "Incluye Short"
  });
  // Adulto Económica
  products.push({
    id: idCounter++,
    name: `${c.name} Económica Adulto`,
    price: 50000,
    image: c.imagenTest || `https://placehold.co/600x800/${c.color}/${c.text}?text=${c.name}+Eco`,
    sizes: sizesAdults,
    country: c.name,
    badge: "Económica"
  });
  // Kids Económica
  products.push({
    id: idCounter++,
    name: `${c.name} Económica Kids`,
    price: 50000,
    image: `https://placehold.co/600x800/${c.color}/${c.text}?text=${c.name}+Kids+Eco`,
    sizes: sizesKids,
    country: c.name,
    badge: "Económica"
  });
});

let activeFilters = [];
let cart = []; // { product, size, qty }

const formatPrice = (price) => {
  return new Intl.NumberFormat('es-PY').format(price) + ' Gs.';
};

// Selectors
const productsContainer = document.getElementById('products-container');
const filterKidsContainer = document.getElementById('filter-kids');
const filterAdultsContainer = document.getElementById('filter-adults');
const clearFiltersBtn = document.getElementById('clear-filters');
const resultsCountTag = document.getElementById('results-count');
const noProductsTag = document.getElementById('no-products');

const cartBtn = document.getElementById('cart-btn');
const closeCartBtn = document.getElementById('close-cart');
const cartOverlay = document.getElementById('cart-overlay');
const cartDrawer = document.getElementById('cart-drawer');
const cartItemsContainer = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const cartTotal = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');
const customerName = document.getElementById('customer-name');
const emptyCartMsg = document.getElementById('empty-cart-msg');

const imageViewer = document.getElementById('image-viewer');
const viewerImg = document.getElementById('viewer-img');
const viewerName = document.getElementById('viewer-name');
const closeViewerBtn = document.getElementById('close-viewer');

let isZoomed = false;

// Init
const init = () => {
  renderFilters();
  renderProducts(products);
  setupEventListeners();
  updateCartUI();
};

const renderFilters = () => {
  const createFilterBtn = (size, container) => {
    const btn = document.createElement('button');
    btn.className = 'w-10 h-10 rounded-lg bg-gray-50 border border-gray-200 text-sm font-bold text-gray-600 flex items-center justify-center transition-all hover:border-albirroja hover:text-albirroja toggle-size-btn';
    btn.dataset.size = size;
    btn.innerText = size;
    btn.addEventListener('click', () => toggleFilter(size, btn));
    container.appendChild(btn);
  };

  sizesKids.forEach(size => createFilterBtn(size, filterKidsContainer));
  sizesAdults.forEach(size => createFilterBtn(size, filterAdultsContainer));
};

const toggleFilter = (size, btnHTML) => {
  if (activeFilters.includes(size)) {
    activeFilters = activeFilters.filter(s => s !== size);
    btnHTML.classList.remove('bg-albirroja', 'text-white', 'border-albirroja', 'shadow-md');
    btnHTML.classList.add('bg-gray-50', 'text-gray-600', 'border-gray-200');
  } else {
    activeFilters.push(size);
    btnHTML.classList.remove('bg-gray-50', 'text-gray-600', 'border-gray-200');
    btnHTML.classList.add('bg-albirroja', 'text-white', 'border-albirroja', 'shadow-md');
  }

  if (activeFilters.length > 0) {
    clearFiltersBtn.classList.remove('hidden');
  } else {
    clearFiltersBtn.classList.add('hidden');
  }

  applyFilters();
};

clearFiltersBtn.addEventListener('click', () => {
  activeFilters = [];
  document.querySelectorAll('.toggle-size-btn').forEach(btn => {
    btn.classList.remove('bg-albirroja', 'text-white', 'border-albirroja', 'shadow-md');
    btn.classList.add('bg-gray-50', 'text-gray-600', 'border-gray-200');
  });
  clearFiltersBtn.classList.add('hidden');
  applyFilters();
});

const applyFilters = () => {
  if (activeFilters.length === 0) {
    renderProducts(products);
    return;
  }

  const filtered = products.filter(p => {
    return activeFilters.some(filterSize => p.sizes.includes(filterSize));
  });

  renderProducts(filtered);
};

const renderProducts = (items) => {
  productsContainer.innerHTML = '';
  resultsCountTag.innerText = `${items.length} producto${items.length !== 1 ? 's' : ''}`;

  if (items.length === 0) {
    productsContainer.classList.add('hidden');
    noProductsTag.classList.remove('hidden');
    return;
  }

  productsContainer.classList.remove('hidden');
  noProductsTag.classList.add('hidden');

  // Group by country
  const grouped = {};
  items.forEach(p => {
    if (!grouped[p.country]) grouped[p.country] = [];
    grouped[p.country].push(p);
  });

  for (const country in grouped) {
    // Render Section Header
    const sectionHeader = document.createElement('div');
    sectionHeader.className = "col-span-full mt-10 mb-2 border-b-2 border-gray-100 pb-3 flex items-center gap-3";
    sectionHeader.innerHTML = `<h2 class="font-heading text-3xl font-black text-dark uppercase">${country}</h2>`;
    productsContainer.appendChild(sectionHeader);

    // Render cards
    grouped[country].forEach(product => {
      const sizesHTML = product.sizes.map(size => `<option value="${size}">${size}</option>`).join('');

      let badgeColor = product.badge === 'Premium Quality' ? 'text-albirroja' : (product.badge === 'Incluye Short' ? 'text-blue-500' : 'text-green-600');
      let badgeIcon = product.badge === 'Premium Quality' ? 'fa-gem' : (product.badge === 'Incluye Short' ? 'fa-child-reaching' : 'fa-tag');

      let badgeBg = product.badge === 'Premium Quality' ? 'bg-dark/90 text-white' : 'bg-white/90 text-dark';

      const card = document.createElement('div');
      card.className = 'product-card bg-white rounded-2xl overflow-hidden border border-gray-100 flex flex-col group';
      card.innerHTML = `
                  <div class="relative overflow-hidden aspect-[4/5] bg-gray-100 group cursor-pointer" onclick="openImageViewer('${product.image}', '${product.name}')">
                      <img src="${product.image}" alt="${product.name}" loading="lazy" decoding="async" class="w-full h-full object-cover group-hover:scale-110 transition duration-700 ease-in-out">
                      <div class="absolute top-4 left-4 ${badgeBg} text-[10px] uppercase font-bold px-3 py-1.5 rounded flex items-center gap-1.5 backdrop-blur-md shadow-sm">
                          <i class="fa-solid ${badgeIcon} ${badgeColor}"></i> ${product.badge}
                      </div>
                      <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div class="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                              <i class="fa-solid fa-expand text-xl"></i>
                          </div>
                      </div>
                  </div>
                  <div class="p-4 sm:p-5 flex flex-col flex-1 bg-white">
                      <h3 class="font-heading font-black text-lg sm:text-xl mb-1 text-dark truncate" title="${product.name}">${product.name}</h3>
                      <p class="font-bold text-albirroja text-lg sm:text-lg mb-4">${formatPrice(product.price)}</p>
                      
                      <div class="mt-auto space-y-3">
                          <div class="relative">
                              <label class="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-wide mb-1.5 block">Seleccionar Talle</label>
                              <select class="w-full appearance-none bg-gray-50 border border-gray-200 text-dark font-medium rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm focus:outline-none focus:border-albirroja focus:ring-1 focus:ring-albirroja transition" id="size-${product.id}">
                                  ${sizesHTML}
                              </select>
                              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 pt-6 text-gray-500">
                                  <i class="fa-solid fa-chevron-down text-xs"></i>
                              </div>
                          </div>
                          <button class="w-full bg-dark hover:bg-albirroja text-white font-bold py-3 rounded-xl transition-colors duration-300 flex items-center justify-center gap-2 text-sm sm:text-base group-hover:shadow-lg" onclick="addToCart(${product.id})">
                              <i class="fa-solid fa-cart-plus"></i> Agregar al Carrito
                          </button>
                      </div>
                  </div>
              `;
      productsContainer.appendChild(card);
    });
  }
};

const addToCart = (productId) => {
  const product = products.find(p => p.id === productId);
  const sizeSelector = document.getElementById(`size-${productId}`);
  const selectedSize = sizeSelector.value;

  const existingItem = cart.find(item => item.product.id === productId && item.size === selectedSize);

  if (existingItem) {
    existingItem.qty += 1;
  } else {
    cart.push({
      product,
      size: selectedSize,
      qty: 1
    });
  }

  updateCartUI();
  openCart();
};

const updateCartQty = (index, delta) => {
  cart[index].qty += delta;
  if (cart[index].qty <= 0) {
    cart.splice(index, 1);
  }
  updateCartUI();
};

const removeCartItem = (index) => {
  cart.splice(index, 1);
  updateCartUI();
};

const updateCartUI = () => {
  cartItemsContainer.innerHTML = '';

  let totalQty = 0;
  let totalPrice = 0;

  if (cart.length === 0) {
    emptyCartMsg.classList.remove('hidden');
  } else {
    emptyCartMsg.classList.add('hidden');

    cart.forEach((item, index) => {
      totalQty += item.qty;
      totalPrice += (item.product.price * item.qty);

      const itemEl = document.createElement('div');
      itemEl.className = 'flex gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm relative group';
      itemEl.innerHTML = `
                    <img src="${item.product.image}" class="w-20 h-24 object-cover rounded-xl bg-gray-50 border border-gray-100">
                    <div class="flex-1 flex flex-col justify-between">
                        <div class="pr-6">
                            <h4 class="font-bold text-sm text-dark leading-snug">${item.product.name}</h4>
                            <p class="text-xs text-gray-500 mt-1 uppercase font-semibold">Talle: <span class="text-albirroja">${item.size}</span></p>
                        </div>
                        
                        <button onclick="removeCartItem(${index})" class="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition"><i class="fa-solid fa-trash-can"></i></button>
                        
                        <div class="flex justify-between items-end mt-2">
                            <p class="font-bold text-dark text-sm">${formatPrice(item.product.price)}</p>
                            
                            <div class="flex items-center gap-3 bg-gray-50 rounded-lg p-1 border border-gray-200">
                                <button class="w-7 h-7 flex items-center justify-center rounded-md bg-white shadow-sm hover:text-albirroja text-gray-600 transition" onclick="updateCartQty(${index}, -1)">
                                    <i class="fa-solid fa-minus text-[10px]"></i>
                                </button>
                                <span class="text-sm font-bold w-4 text-center text-dark">${item.qty}</span>
                                <button class="w-7 h-7 flex items-center justify-center rounded-md bg-white shadow-sm hover:text-albirroja text-gray-600 transition" onclick="updateCartQty(${index}, 1)">
                                    <i class="fa-solid fa-plus text-[10px]"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
      cartItemsContainer.appendChild(itemEl);
    });
  }

  cartCount.innerText = totalQty;

  if (totalQty > 0) {
    cartCount.classList.remove('hidden');
  } else {
    cartCount.classList.add('hidden');
  }

  cartTotal.innerText = formatPrice(totalPrice);
};

const setupEventListeners = () => {
  cartBtn.addEventListener('click', openCart);
  closeCartBtn.addEventListener('click', closeCart);
  cartOverlay.addEventListener('click', closeCart);

  closeViewerBtn.addEventListener('click', closeImageViewer);
  imageViewer.addEventListener('click', (e) => {
    if (e.target === imageViewer || e.target.parentElement === imageViewer) {
      closeImageViewer();
    }
  });

  viewerImg.addEventListener('click', (e) => {
    e.stopPropagation();
    isZoomed = !isZoomed;
    if (isZoomed) {
      viewerImg.classList.remove('cursor-zoom-in');
      viewerImg.classList.add('cursor-zoom-out');
      viewerImg.style.transform = `scale(2)`;
    } else {
      viewerImg.classList.remove('cursor-zoom-out');
      viewerImg.classList.add('cursor-zoom-in');
      viewerImg.style.transform = `scale(1) translate(0, 0)`;
    }
  });

  viewerImg.addEventListener('mousemove', (e) => {
    if (!isZoomed) return;
    const { left, top, width, height } = viewerImg.parentElement.getBoundingClientRect();
    const x = (e.clientX - left) / width;
    const y = (e.clientY - top) / height;
    viewerImg.style.transform = `scale(2.5) translate(${-(x - 0.5) * 50}%, ${-(y - 0.5) * 50}%)`;
  });

  checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
      alert('Tu carrito está vacío. Agrega productos para continuar.');
      return;
    }

    const name = customerName.value.trim();
    if (!name) {
      alert('Por favor, ingresa tu nombre y apellido para enviar el pedido.');
      customerName.focus();
      return;
    }

    formatearYEnviarWhatsApp(name);
  });
};

const openCart = () => {
  cartOverlay.classList.add('active');
  cartDrawer.classList.add('active');
  document.body.style.overflow = 'hidden';
};

const closeCart = () => {
  cartOverlay.classList.remove('active');
  cartDrawer.classList.remove('active');
  document.body.style.overflow = '';
};

const formatearYEnviarWhatsApp = (name) => {
  let mensaje = `*¡Hola! Quiero realizar este pedido en MatheoSport:*\n\n`;
  let total = 0;

  cart.forEach(item => {
    const subtotal = item.product.price * item.qty;
    total += subtotal;
    mensaje += `👕 *${item.product.name}*\n`;
    mensaje += `▫️ Talle: ${item.size}\n`;
    mensaje += `▫️ Cantidad: ${item.qty}\n`;
    mensaje += `▫️ Subtotal: ${formatPrice(subtotal)}\n\n`;
  });

  mensaje += `💰 *TOTAL A PAGAR: ${formatPrice(total)}*\n\n`;
  mensaje += `👤 *Mis datos:* ${name}`;

  const numeroWhatsApp = "595981000000"; // Número Paraguay
  const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;

  window.open(url, '_blank');
};

const openImageViewer = (url, name) => {
  viewerImg.src = url;
  viewerName.innerText = name;
  imageViewer.classList.remove('hidden');
  imageViewer.classList.add('flex');
  document.body.style.overflow = 'hidden';
  isZoomed = false;
  viewerImg.style.transform = 'scale(1)';
  viewerImg.classList.add('cursor-zoom-in');
  viewerImg.classList.remove('cursor-zoom-out');
};

const closeImageViewer = () => {
  imageViewer.classList.add('hidden');
  imageViewer.classList.remove('flex');
  if (!cartDrawer.classList.contains('active')) {
    document.body.style.overflow = '';
  }
};

// Make these functions available globally for inline onclick handlers in HTML
window.addToCart = addToCart;
window.removeCartItem = removeCartItem;
window.updateCartQty = updateCartQty;
window.openImageViewer = openImageViewer;
window.closeImageViewer = closeImageViewer;

// Run
init();
