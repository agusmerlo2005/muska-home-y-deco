const supabaseUrl = 'https://ucjnlylxjaezfgbmckkg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjam5seWx4amFlemZnYm1ja2tnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NDIyOTksImV4cCI6MjA3MzExODI5OX0.N3QoSWDDAkEQ811oOV97aalQTuH25i2bYHHZ0TQt2q0';
const supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);

document.addEventListener('DOMContentLoaded', () => {
    const productForm = document.getElementById('product-form');
    const productName = document.getElementById('product-name');
    const productDescription = document.getElementById('product-description');
    const productPrice = document.getElementById('product-price');
    const productImageUrl = document.getElementById('product-image-url');
    const productCategory = document.getElementById('product-category');
    const productStock = document.getElementById('product-stock');
    const productList = document.getElementById('product-list');
    const logoutBtn = document.getElementById('logout-btn');

    // Cargar y mostrar productos existentes
    async function fetchProducts() {
        const { data: products, error } = await supabase
            .from('products')
            .select('*');

        if (error) {
            console.error('Error al obtener productos:', error);
            return;
        }

        renderProducts(products);
    }

    // Renderizar los productos en la lista
    function renderProducts(products) {
        productList.innerHTML = '';
        products.forEach(product => {
            const productItem = document.createElement('div');
            productItem.classList.add('product-item');
            productItem.innerHTML = `
                <img src="${product.image_url[0]}" alt="${product.name}" style="width:100%; height:auto;">
                <h3>${product.name}</h3>
                <p>Categoría: ${product.category}</p>
                <p>Precio: $${product.price}</p>
                <p>Stock: ${product.stock ? 'Sí' : 'No'}</p>
                <button class="delete-btn" data-id="${product.id}">Eliminar</button>
            `;
            productList.appendChild(productItem);
        });

        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', deleteProduct);
        });
    }

    // Manejar el envío del formulario para agregar un producto
    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const newProduct = {
            name: productName.value,
            description: productDescription.value,
            price: productPrice.value,
            image_url: productImageUrl.value.split(',').map(url => url.trim()),
            category: productCategory.value,
            stock: productStock.checked,
        };

        const { data, error } = await supabase
            .from('products')
            .insert([newProduct]);

        if (error) {
            console.error('Error al agregar el producto:', error);
        } else {
            productForm.reset();
            fetchProducts();
        }
    });

    // Manejar la eliminación de un producto
    async function deleteProduct(e) {
        const productId = e.target.dataset.id;
        const { data, error } = await supabase
            .from('products')
            .delete()
            .eq('id', productId);
        
        if (error) {
            console.error('Error al eliminar el producto:', error);
        } else {
            fetchProducts();
        }
    }

    // Manejar el cierre de sesión
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error('Error al cerrar sesión:', error);
            } else {
                window.location.href = 'index.html';
            }
        });
    }

    fetchProducts();
});