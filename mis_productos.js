const supabaseUrl = 'https://ucjnlylxjaezfgbmckkg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjam5seWx4amFlemZnYm1ja2tnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NDIyOTksImV4cCI6MjA3MzExODI5OX0.N3QoSWDDAkEQ811oOV97aalQTuH25i2bYHHZ0TQt2q0';
const supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);

document.addEventListener('DOMContentLoaded', async () => {
    // Verificación de autenticación
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        // Redirige al usuario a la página de inicio de sesión si no está autenticado
        window.location.href = 'login.html';
    } else {
        // Todo tu código existente para la tabla de productos va aquí
        const productsTable = document.getElementById('products-table'); 
        const searchInput = document.getElementById('search-input');
        const logoutBtn = document.getElementById('logout-btn');
        let allProducts = [];

        async function fetchProducts() {
            const { data: products, error } = await supabase
                .from('products')
                .select('*');

            if (error) {
                console.error('Error al obtener productos:', error);
                return;
            }

            allProducts = products;
            renderProducts(allProducts);
        }

        function renderProducts(products) {
            const tableBody = productsTable.querySelector('tbody');
            tableBody.innerHTML = ''; 

            if (products.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="6">No se encontraron productos.</td></tr>';
                return;
            }
            
            products.forEach(product => {
                const subcategoryDisplay = product.subcategory ? product.subcategory : '-';
                const stockDisplay = product.stock ? 'Sí' : 'No';
                
                const tr = document.createElement('tr');
                tr.dataset.id = product.id;
                tr.classList.add('product-row');
                tr.innerHTML = `
                    <td data-label="Nombre">${product.name}</td>
                    <td data-label="Categoría">${product.category}</td>
                    <td data-label="Subcategoría">${subcategoryDisplay}</td>
                    <td data-label="Precio">$${product.price}</td>
                    <td data-label="Stock">${stockDisplay}</td>
                    <td data-label="Acciones" class="product-actions">
                        <button class="toggle-stock-btn" data-id="${product.id}">
                            ${product.stock ? 'Quitar' : 'Agregar'}
                        </button>
                        <button class="edit-btn" data-id="${product.id}">Editar</button>
                        <button class="delete-btn" data-id="${product.id}">Eliminar</button>
                    </td>
                `;
                tableBody.appendChild(tr);
            });

            document.querySelectorAll('.edit-btn').forEach(button => {
                button.addEventListener('click', loadProductForEdit);
            });
            document.querySelectorAll('.delete-btn').forEach(button => {
                button.addEventListener('click', deleteProduct);
            });
            document.querySelectorAll('.toggle-stock-btn').forEach(button => {
                button.addEventListener('click', toggleProductStock);
            });
        }

        async function loadProductForEdit(e) {
            const productIdToEdit = e.target.dataset.id;
            window.location.href = `admin.html?edit=${productIdToEdit}`;
        }

        async function deleteProduct(e) {
            const productIdToDelete = e.target.dataset.id;
            const confirmDelete = confirm('¿Estás seguro de que quieres eliminar este producto?');
            if (confirmDelete) {
                const { error } = await supabase
                    .from('products')
                    .delete()
                    .eq('id', productIdToDelete);
                
                if (error) {
                    console.error('Error al eliminar el producto:', error);
                } else {
                    e.target.closest('.product-row').remove();
                    alert('Producto eliminado con éxito.');
                }
            }
        }

        async function toggleProductStock(e) {
            const productIdToToggle = e.target.dataset.id;
            const { data: product, error } = await supabase
                .from('products')
                .select('stock')
                .eq('id', productIdToToggle)
                .single();

            if (error) {
                console.error('Error al obtener el stock:', error);
                return;
            }

            const newStockStatus = !product.stock;
            const { error: updateError } = await supabase
                .from('products')
                .update({ stock: newStockStatus })
                .eq('id', productIdToToggle);

            if (updateError) {
                console.error('Error al actualizar el stock:', updateError);
            } else {
                const row = e.target.closest('.product-row');
                const stockCell = row.querySelector('td[data-label="Stock"]');
                
                if (newStockStatus) {
                    stockCell.textContent = 'Sí';
                    e.target.textContent = 'Quitar';
                } else {
                    stockCell.textContent = 'No';
                    e.target.textContent = 'Agregar';
                }
            }
        }

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

        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filteredProducts = allProducts.filter(product => 
                product.name.toLowerCase().includes(searchTerm)
            );
            renderProducts(filteredProducts);
        });

        fetchProducts();
    }
});

const hamburgerBtn = document.getElementById('hamburger-btn');
const adminSidebar = document.getElementById('admin-sidebar');
const overlay = document.getElementById('overlay');

if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', () => {
        adminSidebar.classList.toggle('active');
        overlay.classList.toggle('active');
        hamburgerBtn.classList.toggle('active');
    });
}

if (overlay) {
    overlay.addEventListener('click', () => {
        adminSidebar.classList.remove('active');
        overlay.classList.remove('active');
        hamburgerBtn.classList.remove('active');
    });
}
/* Copia de seguridad*/