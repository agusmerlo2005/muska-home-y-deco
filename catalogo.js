const supabaseUrl = 'https://ucjnlylxjaezfgbmckkg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjam5seWx4amFlemZnYm1ja2tnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NDIyOTksImV4cCI6MjA3MzExODI5OX0.N3QoSWDDAkEQ811oOV97aalQTuH25i2bYHHZ0TQt2q0';

const supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);

document.addEventListener('DOMContentLoaded', () => {
    const productGrid = document.getElementById('product-grid');
    const modal = document.getElementById('image-modal');
    const modalImageContainer = document.getElementById('modal-image-container');
    const closeBtn = document.querySelector('.close-button');
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');

    let currentImages = [];
    let currentIndex = 0;

    async function fetchProducts() {
        try {
            const { data: products, error } = await supabase
                .from('products')
                .select('*');

            if (error) {
                throw new Error(error.message);
            }

            productGrid.innerHTML = '';
            products.forEach(product => {
                const productCard = document.createElement('div');
                productCard.classList.add('product-card');
                
                const stockText = product.stock ? 'En stock' : 'Sin stock';
                const stockClass = product.stock ? 'in-stock' : 'out-of-stock';
                
                productCard.innerHTML = `
                    <img src="${product.image_url[0]}" alt="${product.name}" class="product-image" data-images='${JSON.stringify(product.image_url)}'>
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-price">$${product.price.toLocaleString('es-AR')}</p>
                    <p class="product-description">${product.description}</p>
                    <p class="product-stock ${stockClass}">Estado: ${stockText}</p>
                `;
                productGrid.appendChild(productCard);
            });

            // Agrega el event listener a las imágenes del catálogo
            document.querySelectorAll('.product-image').forEach(image => {
                image.addEventListener('click', (e) => {
                    currentImages = JSON.parse(e.target.dataset.images);
                    currentIndex = 0;
                    modal.style.display = 'block';
                    updateModalImage();
                });
            });

        } catch (error) {
            console.error('Error al cargar los productos:', error.message);
            productGrid.innerHTML = '<p>No se pudieron cargar los productos. Por favor, intente de nuevo más tarde.</p>';
        }
    }

    function updateModalImage() {
        modalImageContainer.innerHTML = '';
        const img = document.createElement('img');
        img.src = currentImages[currentIndex];
        img.classList.add('modal-main-image');
        modalImageContainer.appendChild(img);
    }

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex > 0) ? currentIndex - 1 : currentImages.length - 1;
        updateModalImage();
    });

    nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex < currentImages.length - 1) ? currentIndex + 1 : 0;
        updateModalImage();
    });

    // Cierra el modal si se hace clic fuera de él
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    fetchProducts();
});