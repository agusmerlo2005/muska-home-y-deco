const supabaseUrl = 'https://ucjnlylxjaezfgbmckkg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjam5seWx4amFlemZnYm1ja2tnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NDIyOTksImV4cCI6MjA3MzExODI5OX0.N3QoSWDDAkEQ811oOV97aalQTuH25i2bYHHZ0TQt2q0';

const supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const loginContainer = document.getElementById('login-container');
    const adminPanel = document.getElementById('admin-panel');
    const logoutBtn = document.getElementById('logout-btn');
    const productForm = document.getElementById('product-form');
    const productList = document.getElementById('product-list');

    // Carga los productos al iniciar
    fetchProducts();

    // Maneja el login
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (username === 'jazmin' && password === 'muska') {
            loginContainer.style.display = 'none';
            adminPanel.style.display = 'block';
            alert('¡Bienvenida, Jazmín!');
        } else {
            alert('Usuario o contraseña incorrectos');
        }
    });

    // Maneja el cierre de sesión
    logoutBtn.addEventListener('click', () => {
        loginContainer.style.display = 'block';
        adminPanel.style.display = 'none';
        alert('Sesión cerrada');
    });

    // Maneja la subida del formulario
    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('product-name').value;
        const price = document.getElementById('product-price').value;
        const description = document.getElementById('product-description').value;
        const images = document.getElementById('product-image').files;

        if (!images || images.length === 0) {
            alert('Debes subir al menos una imagen.');
            return;
        }

        try {
            const imageUrls = [];

            // Sube cada imagen a Supabase Storage
            for (const image of images) {
                const filePath = `product_images/${Date.now()}-${image.name}`;
                const { data, error } = await supabase.storage
                    .from('products')
                    .upload(filePath, image);

                if (error) {
                    throw new Error(error.message);
                }

                // Obtiene la URL pública de la imagen
                const { data: publicUrlData } = supabase.storage
                    .from('products')
                    .getPublicUrl(filePath);

                if (publicUrlData) {
                    imageUrls.push(publicUrlData.publicUrl);
                }
            }

            // Inserta el producto en la base de datos con las URLs
            const { data, error } = await supabase
                .from('Products')
                .insert([{
                    name: name,
                    price: parseInt(price),
                    description: description,
                    image_url: imageUrls,
                    stock: true
                }]);

            if (error) {
                throw new Error(error.message);
            }

            alert('Producto agregado con éxito!');
            productForm.reset();
            fetchProducts();

        } catch (error) {
            console.error('Error al agregar el producto:', error.message);
            alert('Ocurrió un error al agregar el producto: ' + error.message);
        }
    });

    // Muestra todos los productos
    async function fetchProducts() {
        const { data: products, error } = await supabase
            .from('Products')
            .select('*');

        if (error) {
            console.error('Error al obtener productos:', error);
            return;
        }

        productList.innerHTML = '';
        products.forEach(product => {
            const productDiv = document.createElement('div');
            productDiv.classList.add('product-item');
            productDiv.innerHTML = `
                <img src="${product.image_url[0]}" alt="${product.name}" class="product-image">
                <p class="product-name">${product.name}</p>
                <p class="product-price">$${product.price.toLocaleString('es-AR')}</p>
                <button class="toggle-stock-btn" data-id="${product.id}" data-stock="${product.stock}">${product.stock ? 'Quitar stock' : 'Añadir stock'}</button>
                <button class="delete-btn" data-id="${product.id}">Eliminar</button>
            `;
            productList.appendChild(productDiv);
        });
    }

    // Maneja la eliminación y el cambio de stock
    productList.addEventListener('click', async (e) => {
        const id = e.target.dataset.id;
        if (e.target.classList.contains('delete-btn')) {
            if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
                const { error } = await supabase
                    .from('Products')
                    .delete()
                    .eq('id', id);

                if (error) {
                    console.error('Error al eliminar:', error);
                } else {
                    alert('Producto eliminado con éxito.');
                    fetchProducts();
                }
            }
        }

        if (e.target.classList.contains('toggle-stock-btn')) {
            const currentStock = e.target.dataset.stock === 'true';
            const { error } = await supabase
                .from('Products')
                .update({ stock: !currentStock })
                .eq('id', id);

            if (error) {
                console.error('Error al actualizar el stock:', error);
            } else {
                alert('Stock actualizado con éxito.');
                fetchProducts();
            }
        }
    });
});