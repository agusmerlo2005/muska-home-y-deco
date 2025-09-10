const supabaseUrl = 'https://ucjnlylxjaezfgbmckkg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjam5seWx4amFlemZnYm1ja2tnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NDIyOTksImV4cCI6MjA3MzExODI5OX0.N3QoSWDDAkEQ811oOV97aalQTuH25i2bYHHZ0TQt2q0';

const supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);

document.addEventListener('DOMContentLoaded', () => {
    const productGrid = document.getElementById('product-grid');

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
                productCard.innerHTML = `
                    <img src="${product.image_url[0]}" alt="${product.name}" class="product-image">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-price">$${product.price.toLocaleString('es-AR')}</p>
                    <button class="buy-button">Comprar</button>
                `;
                productGrid.appendChild(productCard);
            });
        } catch (error) {
            console.error('Error al cargar los productos:', error.message);
            productGrid.innerHTML = '<p>No se pudieron cargar los productos. Por favor, intente de nuevo más tarde.</p>';
        }
    }

    fetchProducts();
});