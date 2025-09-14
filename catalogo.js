const supabaseUrl = 'https://ucjnlylxjaezfgbmckkg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjam5seWx4amFlemZnYm1ja2tnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NDIyOTksImV4cCI6MjA3MzExODI5OX0.N3QoSWDDAkEQ811oOV97aalQTuH25i2bYHHZ0TQt2q0';
const supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);

let currentProducts = [];
let currentImageIndex = 0;
let currentImageUrls = [];

document.addEventListener('DOMContentLoaded', () => {
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const filterMenu = document.getElementById('filter-menu');
    const modalOverlay = document.getElementById('modal-overlay');
    const productGrid = document.getElementById('product-grid');
    const imageModal = document.getElementById('image-modal');
    const closeBtn = document.querySelector('.close-button');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    // Función para obtener productos de Supabase
    async function fetchProducts(category = null, subcategory = null) {
        let query = supabase.from('products').select('*');

        if (category === 'all') {
            // Mostrar todos los productos
            query = supabase.from('products').select('*');
        } else if (subcategory) {
            // Filtrar por subcategoría
            query = query.eq('subcategory', subcategory);
        } else if (category) {
            // Filtrar por categoría principal
            query = query.eq('category', category);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error al obtener productos:', error.message);
            productGrid.innerHTML = '<p class="error-message">No se pudieron cargar los productos. Por favor, inténtelo de nuevo más tarde.</p>';
            return;
        }

        if (data.length === 0) {
            productGrid.innerHTML = '<p class="no-results-message">No hay productos en esta categoría.</p>';
            currentProducts = [];
            return;
        }

        currentProducts = data;
        renderProducts(data);
    }

    // Función para renderizar los productos en la cuadrícula
    function renderProducts(products) {
        productGrid.innerHTML = '';
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.classList.add('product-card');

            const stockStatus = product.stock ? 'in-stock' : 'out-of-stock';
            const stockText = product.stock ? 'En Stock' : 'Sin Stock';

            productCard.innerHTML = `
                <div class="product-image-container">
                    <img class="product-image" src="${product.image_url}" alt="${product.name}">
                </div>
                <h3>${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <p class="product-price">$${product.price}</p>
                <span class="product-stock ${stockStatus}">${stockText}</span>
            `;

            productCard.addEventListener('click', () => {
                openImageModal(product.image_url);
            });

            productGrid.appendChild(productCard);
        });
    }

    // Funciones para el modal de imágenes
    function openImageModal(imageUrl) {
        currentImageUrls = [imageUrl]; // Solo una imagen por ahora
        currentImageIndex = 0;
        updateModalImage();
        imageModal.style.display = 'block';
        modalOverlay.style.display = 'block';
    }

    function updateModalImage() {
        if (currentImageUrls.length > 0) {
            const img = document.createElement('img');
            img.src = currentImageUrls[currentImageIndex];
            img.classList.add('modal-main-image');
            const modalImageContainer = document.getElementById('modal-image-container');
            modalImageContainer.innerHTML = ''; // Limpiar
            modalImageContainer.appendChild(img);
        }
    }

    closeBtn.addEventListener('click', () => {
        imageModal.style.display = 'none';
        modalOverlay.style.display = 'none';
    });

    modalOverlay.addEventListener('click', () => {
        imageModal.style.display = 'none';
        modalOverlay.style.display = 'none';
    });

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentImageIndex = (currentImageIndex - 1 + currentImageUrls.length) % currentImageUrls.length;
            updateModalImage();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentImageIndex = (currentImageIndex + 1) % currentImageUrls.length;
            updateModalImage();
        });
    }

    // Eventos del menú de filtrado
    hamburgerBtn.addEventListener('click', () => {
        filterMenu.classList.toggle('active');
        modalOverlay.classList.toggle('active');
        hamburgerBtn.classList.toggle('active');
    });

    modalOverlay.addEventListener('click', () => {
        filterMenu.classList.remove('active');
        modalOverlay.classList.remove('active');
        hamburgerBtn.classList.remove('active');
    });

    filterMenu.querySelectorAll('.filter-link').forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const category = event.target.dataset.category;
            const subcategory = event.target.dataset.subcategory;
            fetchProducts(category, subcategory);
            filterMenu.classList.remove('active');
            modalOverlay.classList.remove('active');
            hamburgerBtn.classList.remove('active');
        });
    });

    // Cargar todos los productos al inicio
    fetchProducts('all');
});