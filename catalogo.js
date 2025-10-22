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

    // Referencia al contenedor de paginación existente en el HTML
    const paginationContainer = document.getElementById('pagination-container');

    let currentProducts = [];
    let currentIndex = 0;
    let currentImageUrls = [];

    // VARIABLES PARA PAGINACIÓN
    const itemsPerPage = 10;
    let currentPage = 1;
    let totalProducts = 0;

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
                // Para filtrar localmente (mantiene la paginación, pero solo muestra los productos filtrados en la página actual)
                let productsToFilter = currentProducts; 
                let filteredProducts;
                
                if (subcategory) {
                    filteredProducts = productsToFilter.filter(p => p.subcategory === subcategory);
                } else {
                    filteredProducts = productsToFilter.filter(p => p.category === category);
                }
                
                // Nota: Si el filtro se aplica localmente, la paginación sigue mostrando el número total de páginas
                // que había antes de filtrar, pero solo los productos filtrados aparecerán en la cuadrícula.
                // Para un filtro completo, se debe llamar a fetchProducts con el filtro, pero esto requiere 
                // reajustar la lógica de paginación para los resultados filtrados. Por ahora, mantendremos la lógica actual.
                renderProducts(filteredProducts);
            }

            filterMenu.classList.remove('active');
            modalOverlay.style.display = 'none';
        }
    });

    // LÓGICA DE PAGINACIÓN (USA <a> Y CLASE 'activo')
    function renderPagination() {
        if (!paginationContainer) return; // Asegurarse de que existe
        
        const totalPages = Math.ceil(totalProducts / itemsPerPage);
        paginationContainer.innerHTML = '';

        if (totalPages > 1) {
            // Botón Anterior
            const prevLink = document.createElement('a');
            prevLink.textContent = 'Anterior';
            prevLink.href = `#`;
            prevLink.classList.add('anterior'); 
            
            if (currentPage === 1) {
                prevLink.style.opacity = 0.5;
                prevLink.style.pointerEvents = 'none';
            }

            prevLink.addEventListener('click', (e) => {
                e.preventDefault(); 
                if (currentPage > 1) {
                    currentPage--;
                    fetchProducts(currentPage);
                }
            });
            paginationContainer.appendChild(prevLink);

            // Botones de Número de Página
            for (let i = 1; i <= totalPages; i++) {
                const pageLink = document.createElement('a'); 
                pageLink.textContent = i;
                pageLink.href = `?page=${i}`;

                if (i === currentPage) {
                    pageLink.classList.add('activo'); // CLASE PARA EL ESTILO MUSKA
                }
                pageLink.addEventListener('click', (e) => {
                    e.preventDefault(); 
                    currentPage = i;
                    fetchProducts(currentPage);
                });
                paginationContainer.appendChild(pageLink);
            }

            // Botón Siguiente
            const nextLink = document.createElement('a');
            nextLink.textContent = 'Siguiente';
            nextLink.href = `#`;
            nextLink.classList.add('siguiente');

            if (currentPage === totalPages) {
                nextLink.style.opacity = 0.5;
                nextLink.style.pointerEvents = 'none';
            }

            nextLink.addEventListener('click', (e) => {
                e.preventDefault();
                if (currentPage < totalPages) {
                    currentPage++;
                    fetchProducts(currentPage);
                }
            });
            paginationContainer.appendChild(nextLink);
        }
    }

    // Cargar productos al iniciar la página
    fetchProducts();
});