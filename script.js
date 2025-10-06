document.addEventListener('DOMContentLoaded', () => {
    // Elemen utama
    const productGrid = document.getElementById('product-grid');
    const loader = document.getElementById('loader');
    const errorMessage = document.getElementById('error-message');
    const cartCount = document.getElementById('cart-count');

    // Modal produk
    const modal = document.getElementById('productModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const modalImage = document.getElementById('modal-image');
    const modalCategory = document.getElementById('modal-category');
    const modalProductName = document.getElementById('modal-product-name');
    const modalPrice = document.getElementById('modal-price');
    const modalDescription = document.getElementById('modal-description');
    const modalAddToCartBtn = document.getElementById('modal-add-to-cart');

    const toastContainer = document.getElementById('toast-container');

    // Modal checkout
    const cartIcon = document.getElementById('cartIcon');
    const checkoutModal = document.getElementById('checkoutModal');
    const closeCheckoutBtn = document.getElementById('closeCheckoutBtn');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalEl = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const buyerAddressEl = document.getElementById('buyer-address');
    const buyerNameEl = document.getElementById('buyer-name');
    const buyerPhoneEl = document.getElementById('buyer-phone');

    // State
    let products = [];
    let cart = [];
    const API_URL = 'https://fakestoreapi.com/products';

    // Ambil produk
    async function fetchProducts() {
        loader.style.display = 'block';
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Gagal memuat produk');
            products = await response.json();
            displayProducts(products);
        } catch (err) {
            console.error(err);
            errorMessage.classList.remove('hidden');
        } finally {
            loader.style.display = 'none';
        }
    }

    // Tampilkan produk
    function displayProducts(data) {
        productGrid.innerHTML = '';
        data.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card bg-white rounded-lg shadow-sm overflow-hidden flex flex-col cursor-pointer';
            card.dataset.productId = product.id;

            card.innerHTML = `
                <div class="p-4 bg-white h-48 flex items-center justify-center">
                    <img src="${product.image}" alt="${product.title}" class="max-h-full max-w-full object-contain">
                </div>
                <div class="p-4 border-t border-gray-200 flex flex-col flex-grow">
                    <span class="text-xs text-gray-500 capitalize">${product.category}</span>
                    <h3 class="text-md font-semibold text-gray-800 mt-1 flex-grow">${product.title.substring(0, 40)}...</h3>
                    <div class="mt-4 flex justify-between items-center">
                        <p class="text-lg font-bold text-blue-600">Rp ${Math.round(product.price * 15000).toLocaleString('id-ID')}</p>
                        <button class="add-to-cart-btn bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-full w-9 h-9 flex items-center justify-center transition-colors" data-product-id="${product.id}">
                            <i class="fas fa-cart-plus"></i>
                        </button>
                    </div>
                </div>
            `;
            productGrid.appendChild(card);
        });
    }

    // Detail produk
    function showProductDetail(productId) {
        const p = products.find(p => p.id == productId);
        if (!p) return;
        modalImage.src = p.image;
        modalCategory.textContent = p.category;
        modalProductName.textContent = p.title;
        modalPrice.textContent = `Rp ${Math.round(p.price * 15000).toLocaleString('id-ID')}`;
        modalDescription.textContent = p.description;
        modalAddToCartBtn.dataset.productId = p.id;
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
    function hideModal() {
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }

    // Tambah ke keranjang
    function addToCart(id) {
        const p = products.find(p => p.id == id);
        if (p) {
            cart.push(p);
            updateCartCounter();
            showToast(`${p.title.substring(0, 25)}... ditambahkan ke keranjang!`);
        }
    }
    // === Checkout ===
    cartIcon.addEventListener('click', () => {
        if (cart.length === 0) {
            showToast("Keranjang masih kosong!");
            return;
        }
        renderCartItems();
        checkoutModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    });
    closeCheckoutBtn.addEventListener('click', () => {
        checkoutModal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    });

    function renderCartItems() {
        cartItemsContainer.innerHTML = '';
        let total = 0;
        cart.forEach(item => {
            const harga = Math.round(item.price * 15000);
            total += harga;
            const div = document.createElement('div');
            div.className = 'flex justify-between items-center bg-gray-50 p-3 rounded-lg shadow-sm';
            div.innerHTML = `
                <div class="flex items-center space-x-3">
                    <img src="${item.image}" class="w-12 h-12 object-contain">
                    <p class="text-sm font-medium text-gray-800">${item.title.substring(0, 35)}...</p>
                </div>
                <div class="text-blue-600 font-semibold">Rp ${harga.toLocaleString('id-ID')}</div>
            `;
            cartItemsContainer.appendChild(div);
        });
        cartTotalEl.textContent = `Rp ${total.toLocaleString('id-ID')}`;
    }

    // Kirim WA
    checkoutBtn.addEventListener('click', () => {
        // Read buyer details
        const nama = buyerNameEl ? buyerNameEl.value.trim() : '';
        const alamat = buyerAddressEl ? buyerAddressEl.value.trim() : '';
        const phone = buyerPhoneEl ? buyerPhoneEl.value.trim() : '';

        // Validasi sederhana
        if (!nama) {
            showToast('Mohon isi nama lengkap penerima.');
            if (buyerNameEl) buyerNameEl.focus();
            return;
        }
        if (!phone) {
            showToast('Mohon isi nomor HP/WhatsApp penerima.');
            if (buyerPhoneEl) buyerPhoneEl.focus();
            return;
        }
        // Simple phone validation: only digits, length 6-15
        const phoneDigits = phone.replace(/[^0-9]/g, '');
        if (phoneDigits.length < 6 || phoneDigits.length > 15) {
            showToast('Mohon masukkan nomor HP yang valid (6-15 digit).');
            if (buyerPhoneEl) buyerPhoneEl.focus();
            return;
        }
        if (!alamat) {
            showToast('Mohon isi alamat pengiriman sebelum melanjutkan.');
            if (buyerAddressEl) buyerAddressEl.focus();
            return;
        }

        let pesan = "Halo, saya ingin memesan:\n\n";
        let total = 0;
        cart.forEach(item => {
            const harga = Math.round(item.price * 15000);
            total += harga;
            pesan += `• ${item.title.substring(0, 40)} - Rp ${harga.toLocaleString('id-ID')}\n`;
        });
        pesan += `\nTotal: Rp ${total.toLocaleString('id-ID')}\n\n`;
        pesan += `Nama: ${nama}\nHP: ${phone}\nAlamat:\n${alamat}\n\nTerima kasih! 🙏`;
        // Gunakan nomor tujuan dari input buyer-phone, format ke bentuk internasional untuk wa.me
        let targetNumber = phoneDigits; // phoneDigits sudah hanya angka
        // Format untuk nomor Indonesia
        if (targetNumber.startsWith('0')) {
            targetNumber = '62' + targetNumber.slice(1);
        } else if (targetNumber.startsWith('8')) {
            targetNumber = '62' + targetNumber;
        } else if (targetNumber.startsWith('62')) {
            // sudah benar
        } else {
            // nomor mungkin dengan kode negara lain, biarkan apa adanya
        }

        // Jika setelah formatting nomor masih pendek, fallback ke nomor default (penjual)
        const defaultNumber = ""; // ubah ke nomor penjual jika perlu
        const nomor = (targetNumber.length >= 6 && targetNumber.length <= 15) ? targetNumber : defaultNumber;
        if (nomor === defaultNumber) showToast('Nomor tujuan tidak valid, menggunakan nomor default penjual.');

        const url = `https://wa.me/${nomor}?text=${encodeURIComponent(pesan)}`;
        window.open(url, "_blank");
    });

    // === Event ===
    productGrid.addEventListener('click', (e) => {
        const btn = e.target.closest('.add-to-cart-btn');
        if (btn) {
            addToCart(btn.dataset.productId);
            return;
        }
        const card = e.target.closest('.product-card');
        if (card) showProductDetail(card.dataset.productId);
    });
    modalAddToCartBtn.addEventListener('click', () => {
        addToCart(modalAddToCartBtn.dataset.productId);
        hideModal();
    });
    closeModalBtn.addEventListener('click', hideModal);
    modal.addEventListener('click', e => { if (e.target === modal) hideModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.classList.contains('hidden')) hideModal(); });

    // Jalankan
    fetchProducts();
});
