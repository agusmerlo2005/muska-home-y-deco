const supabaseUrl = 'https://ucjnlylxjaezfgbmckkg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjam5seWx4amFlemZnYm1ja2tnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NDIyOTksImV4cCI6MjA3MzExODI5OX0.N3QoSWDDAkEQ811oOV97aalQTuH25i2bYHHZ0TQt2q0';
const supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);

document.addEventListener('DOMContentLoaded', () => {
    const productList = document.getElementById('product-list');
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
        if (products.length === 0) {
            productList.innerHTML = '<p>No se encontraron productos.</p>';
            return;
        }

        let tableHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Categoría</th>
                        <th>Subcategoría</th>
                        <th>Precio</th>
                        <th>Stock</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
        `;

        products.forEach(product => {
            const subcategoryDisplay = product.subcategory ? product.subcategory : '-';
            const stockDisplay = product.stock ? 'Sí' : 'No';
            
            tableHTML += `
                <tr data-id="${product.id}">
                    <td>${product.name}</td>
                    <td>${product.category}</td>
                    <td>${subcategoryDisplay}</td>
                    <td>$${product.price}</td>
                    <td>${stockDisplay}</td>
                    <td>
                        <button class="toggle-stock-btn" data-id="${product.id}">
                            ${product.stock ? 'Quitar' : 'Agregar'}
                        </button>
                        <button class="edit-btn" data-id="${product.id}">Editar</button>
                        <button class="delete-btn" data-id="${product.id}">Eliminar</button>
                    </td>
                </tr>
            `;
        });
        
        tableHTML += `
                </tbody>
            </table>
        `;
        productList.innerHTML = tableHTML;

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
                fetchProducts();
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
            fetchProducts();
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
});