const supabaseUrl = 'https://ucjnlylxjaezfgbmckkg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjam5seWx4amFlemZnYm1ja2tnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NDIyOTksImV4cCI6MjA3MzExODI5OX0.N3QoSWDDAkEQ811oOV97aalQTuH25i2bYHHZ0TQt2q0';
const supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);

document.addEventListener('DOMContentLoaded', () => {
    const productGrid = document.getElementById('product-grid');
    const categoryFilter = document.getElementById('category-filter');
    const modal = document.getElementById('image-modal');
    const modalImageContainer = document.getElementById('modal-image-container');
    const closeButton = document.querySelector('.close-button');
    const prevButton = document.querySelector('.modal-nav.prev');
    const nextButton = document.querySelector('.modal-nav.next');

    let currentImages = [];
    let currentImageIndex = 0;

    async function fetchProducts(category = 'all') {
        try {
            let query = supabase
                .from('products')
                .select('*');

            if (category !== 'all') {
                query = query.eq('category', category);
            }

            const { data: products, error } = await query;

            if (error) {
                console.error('Error al obtener productos:', error);
                productGrid.innerHTML = '<p>Error al cargar los productos.</p>';
                return;
            }

            productGrid.innerHTML = '';

            if (products.length === 0) {
                productGrid.innerHTML = '<p>No hay productos en esta categoría.</p>';
                return;
            }

            products.forEach(product => {
                const productCard = document.createElement('div');
                productCard.classList.add('product-card');

                let stockStatus = 'Sin stock';
                let stockClass = 'out-of-stock';
                let priceHtml = '';

                if (product.stock) {
                    stockStatus = 'Con stock';
                    stockClass = 'in-stock';
                    priceHtml = `<p class="product-price">$${product.price.toLocaleString('es-AR')}</p>`;
                }

                productCard.innerHTML = `
                    <img src="${product.image_url[0]}" alt="${product.name}" class="product-image">
                    <h3>${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <p class="product-stock ${stockClass}">${stockStatus}</p>
                    ${priceHtml}
                `;
                
                if (product.image_url && product.image_url.length > 0) {
                    productCard.querySelector('.product-image').addEventListener('click', () => {
                        currentImages = product.image_url;
                        currentImageIndex = 0;
                        updateModalImage();
                        modal.style.display = 'block';
                    });
                }

                productGrid.appendChild(productCard);
            });
        } catch (error) {
            console.error('Error en fetchProducts:', error.message);
        }
    }

    // Funciones para la galería de imágenes (modal)
    function updateModalImage() {
        modalImageContainer.innerHTML = `<img src="${currentImages[currentImageIndex]}" class="modal-main-image">`;
    }

    function showNextImage() {
        currentImageIndex = (currentImageIndex + 1) % currentImages.length;
        updateModalImage();
    }

    function showPrevImage() {
        currentImageIndex = (currentImageIndex - 1 + currentImages.length) % currentImages.length;
        updateModalImage();
    }

    // Event Listeners
    if (categoryFilter) {
        categoryFilter.addEventListener('change', (event) => {
            const selectedCategory = event.target.value;
            fetchProducts(selectedCategory);
        });
    }

    closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    prevButton.addEventListener('click', showPrevImage);
    nextButton.addEventListener('click', showNextImage);

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    fetchProducts();
});