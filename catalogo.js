const SUPABASE_URL = 'https://ucjnlylxjaezfgbmckkg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjam5seWx4amFlemZnYm1ja2tnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NDIyOTksImV4cCI6MjA3MzExODI5OX0.N3QoSWDDAkEQ811oOV97aalQTuH25i2bYHHZ0TQt2q0';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', () => {
    const productGrid = document.getElementById('product-grid');
    const filterMenu = document.getElementById('filter-menu');
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const imageModal = document.getElementById('image-modal');
    const modalImageContainer = document.getElementById('modal-image-container');
    const closeModalButton = document.querySelector('.close-button');
    const modalNavPrev = document.querySelector('.modal-nav.prev');
    const modalNavNext = document.querySelector('.modal-nav.next');
    const modalOverlay = document.getElementById('modal-overlay');

    let currentProducts = [];
    let currentIndex = 0;
    let currentImageUrls = [];

    // VARIABLES PARA PAGINACIÓN
    const itemsPerPage = 10;
    let currentPage = 1;
    let totalProducts = 0;
    
    // CREAR Y AGREGAR CONTENEDOR DE PAGINACIÓN AL DOM
    const paginationContainer = document.createElement('div');
    paginationContainer.classList.add('pagination-container');
    productGrid.parentNode.insertBefore(paginationContainer, productGrid.nextSibling);

    // Abrir/cerrar menú en dispositivos móviles
    hamburgerBtn.addEventListener('click', () => {
        filterMenu.classList.toggle('active');
        modalOverlay.style.display = filterMenu.classList.contains('active') ? 'block' : 'none';
    });

    modalOverlay.addEventListener('click', () => {
        filterMenu.classList.remove('active');
        modalOverlay.style.display = 'none';
    });

    // Función para obtener productos de Supabase con paginación y filtros
    async function fetchProducts(page = 1, category = 'all', subcategory = null) {
        const from = (page - 1) * itemsPerPage;
        const to = from + itemsPerPage - 1;

        let query = supabase.from('products').select('*', { count: 'exact' });

        if (category !== 'all') {
            query = query.eq('category', category);
        }
        if (subcategory) {
            query = query.eq('subcategory', subcategory);
        }

        query = query.range(from, to);

        const { data: products, count, error } = await query;

        if (error) {
            console.error('Error al obtener productos:', error);
            return;
        }

        currentProducts = products;
        totalProducts = count;
        renderProducts(products);
        renderPagination();
    }
    
    // Función para renderizar los productos en la cuadrícula
    function renderProducts(products) {
        productGrid.innerHTML = '';
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.classList.add('product-card');

            // Maneja la URL de la imagen, ya sea un array o un string
            const imageUrl = Array.isArray(product.image_url) ? product.image_url[0] : product.image_url;

            productCard.innerHTML = `
                <div class="product-image-container">
                    <img src="${imageUrl}" alt="${product.name}" class="product-image" data-urls='${JSON.stringify(product.image_url)}'>
                </div>
                <div class="product-details">
                    <h3>${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <p class="product-price">$${product.price}</p>
                    <div class="product-stock ${product.stock ? 'con-stock' : 'sin-stock'}">
                        ${product.stock ? 'En Stock' : 'Sin Stock'}
                    </div>
                </div>
            `;
            productGrid.appendChild(productCard);
        });
    }

    // Manejar clics en las imágenes para abrir el modal
    productGrid.addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('product-image')) {
            imageModal.style.display = 'block';
            modalOverlay.style.display = 'block';
            currentImageUrls = JSON.parse(target.dataset.urls);
            currentIndex = 0;
            displayModalImage();
        }
    });

    // Mostrar la imagen actual en el modal
    function displayModalImage() {
        modalImageContainer.innerHTML = '';
        const img = document.createElement('img');
        img.src = currentImageUrls[currentIndex];
        img.classList.add('modal-main-image');
        modalImageContainer.appendChild(img);
        modalNavPrev.style.display = currentIndex > 0 ? 'block' : 'none';
        modalNavNext.style.display = currentIndex < currentImageUrls.length - 1 ? 'block' : 'none';
    }

    // Navegar en el modal
    modalNavPrev.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            displayModalImage();
        }
    });

    modalNavNext.addEventListener('click', () => {
        if (currentIndex < currentImageUrls.length - 1) {
            currentIndex++;
            displayModalImage();
        }
    });

    // Cerrar modal
    closeModalButton.addEventListener('click', () => {
        imageModal.style.display = 'none';
        modalOverlay.style.display = 'none';
    });

    // Manejar clics en el menú de filtro
    filterMenu.addEventListener('click', (e) => {
        e.preventDefault();
        const target = e.target;
        
        if (target.classList.contains('filter-link')) {
            const category = target.dataset.category;
            const subcategory = target.dataset.subcategory;
            
            // Si es 'all', traemos todos con paginación. Si no, usamos el filtro y sin paginación temporalmente
            if (category === 'all' && !subcategory) {
                currentPage = 1;
                fetchProducts(currentPage);
            } else {
                let filteredProducts;
                if (subcategory) {
                    filteredProducts = currentProducts.filter(p => p.subcategory === subcategory);
                } else {
                    filteredProducts = currentProducts.filter(p => p.category === category);
                }
                renderProducts(filteredProducts);
            }

            filterMenu.classList.remove('active');
            modalOverlay.style.display = 'none';
        }
    });

    // LÓGICA DE PAGINACIÓN
    function renderPagination() {
        const totalPages = Math.ceil(totalProducts / itemsPerPage);
        paginationContainer.innerHTML = '';

        if (totalPages > 1) {
            const prevButton = document.createElement('button');
            prevButton.textContent = 'Anterior';
            prevButton.disabled = currentPage === 1;
            prevButton.addEventListener('click', () => {
                currentPage--;
                fetchProducts(currentPage);
            });
            paginationContainer.appendChild(prevButton);

            for (let i = 1; i <= totalPages; i++) {
                const pageButton = document.createElement('button');
                pageButton.textContent = i;
                if (i === currentPage) {
                    pageButton.classList.add('active');
                }
                pageButton.addEventListener('click', () => {
                    currentPage = i;
                    fetchProducts(currentPage);
                });
                paginationContainer.appendChild(pageButton);
            }

            const nextButton = document.createElement('button');
            nextButton.textContent = 'Siguiente';
            nextButton.disabled = currentPage === totalPages;
            nextButton.addEventListener('click', () => {
                currentPage++;
                fetchProducts(currentPage);
            });
            paginationContainer.appendChild(nextButton);
        }
    }

    // Cargar productos al iniciar la página
    fetchProducts();
});