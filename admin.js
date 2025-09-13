const supabaseUrl = 'https://ucjnlylxjaezfgbmckkg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjam5seWx4amFlemZnYm1ja2tnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NDIyOTksImV4cCI6MjA3MzExODI5OX0.N3QoSWDDAkEQ811oOV97aalQTuH25i2bYHHZ0TQt2q0';
const supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);

document.addEventListener('DOMContentLoaded', () => {
    const productForm = document.getElementById('product-form');
    const formTitle = document.getElementById('form-title');
    const productId = document.getElementById('product-id');
    const productName = document.getElementById('product-name');
    const productDescription = document.getElementById('product-description');
    const productPrice = document.getElementById('product-price');
    const productImage = document.getElementById('product-image');
    const productCategory = document.getElementById('product-category');
    const productSubcategory = document.getElementById('product-subcategory');
    const subcategoryGroup = document.getElementById('subcategory-group');
    const productStock = document.getElementById('product-stock');
    const submitBtn = document.getElementById('submit-btn');
    const productList = document.getElementById('product-list');
    const logoutBtn = document.getElementById('logout-btn');

    // Manejar la visibilidad del menú de subcategorías
    productCategory.addEventListener('change', () => {
        if (productCategory.value === 'Cocina') {
            subcategoryGroup.style.display = 'block';
        } else {
            subcategoryGroup.style.display = 'none';
        }
    });

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
            const subcategoryDisplay = product.subcategory ? `<br>Subcategoría: ${product.subcategory}` : '';
            productItem.innerHTML = `
                <img src="${product.image_url[0]}" alt="${product.name}" style="width:100%; height:auto;">
                <h3>${product.name}</h3>
                <p>Categoría: ${product.category}${subcategoryDisplay}</p>
                <p>Precio: $${product.price}</p>
                <p>Stock: ${product.stock ? 'Sí' : 'No'}</p>
                <button class="toggle-stock-btn" data-id="${product.id}" data-stock="${product.stock}">
                    ${product.stock ? 'Quitar stock' : 'Agregar stock'}
                </button>
                <button class="edit-btn" data-id="${product.id}">Editar</button>
                <button class="delete-btn" data-id="${product.id}">Eliminar</button>
            `;
            productList.appendChild(productItem);
        });

        document.querySelectorAll('.toggle-stock-btn').forEach(button => {
            button.addEventListener('click', toggleStock);
        });
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', loadProductForEdit);
        });
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', deleteProduct);
        });
    }

    // Nueva función para alternar el estado del stock
    async function toggleStock(e) {
        const productIdToToggle = e.target.dataset.id;
        const currentStockStatus = e.target.dataset.stock === 'true';
        const newStockStatus = !currentStockStatus;
        
        const { error } = await supabase
            .from('products')
            .update({ stock: newStockStatus })
            .eq('id', productIdToToggle);
        
        if (error) {
            console.error('Error al actualizar el stock:', error);
        } else {
            fetchProducts();
        }
    }

    // Manejar el envío del formulario para agregar/editar
    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const isEditing = productId.value !== '';
        
        const productData = {
            name: productName.value,
            description: productDescription.value,
            price: productPrice.value,
            category: productCategory.value,
            subcategory: productCategory.value === 'Cocina' ? productSubcategory.value : null,
            stock: productStock.checked,
        };

        if (isEditing) {
            // Lógica para editar un producto
            const { error } = await supabase
                .from('products')
                .update(productData)
                .eq('id', productId.value);

            if (error) {
                console.error('Error al actualizar el producto:', error);
            } else {
                productForm.reset();
                productId.value = '';
                formTitle.textContent = 'Agregar Nuevo Producto';
                submitBtn.textContent = 'Agregar Producto';
                subcategoryGroup.style.display = 'none';
                fetchProducts();
            }
        } else {
            // Lógica para agregar un nuevo producto
            const files = productImage.files;
            if (files.length === 0) {
                alert('Por favor, sube al menos una imagen.');
                return;
            }
            
            const imageUrls = [];
            for (const file of files) {
                const filePath = `products/${Date.now()}-${file.name}`;
                const { data, error } = await supabase.storage.from('products').upload(filePath, file);

                if (error) {
                    console.error('Error al subir la imagen:', error);
                    alert('Error al subir la imagen.');
                    return;
                }
                const publicURL = `${supabaseUrl}/storage/v1/object/public/products/${data.path}`;
                imageUrls.push(publicURL);
            }

            const newProduct = {
                ...productData,
                image_url: imageUrls,
            };

            const { error } = await supabase
                .from('products')
                .insert([newProduct]);

            if (error) {
                console.error('Error al agregar el producto:', error);
            } else {
                productForm.reset();
                subcategoryGroup.style.display = 'none';
                fetchProducts();
            }
        }
    });

    // Cargar producto para editar
    async function loadProductForEdit(e) {
        const productIdToEdit = e.target.dataset.id;
        const { data: product, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', productIdToEdit)
            .single();
        
        if (error) {
            console.error('Error al cargar el producto para editar:', error);
            return;
        }

        productId.value = product.id;
        productName.value = product.name;
        productDescription.value = product.description;
        productPrice.value = product.price;
        productCategory.value = product.category;
        productStock.checked = product.stock;

        if (product.category === 'Cocina' && product.subcategory) {
            subcategoryGroup.style.display = 'block';
            productSubcategory.value = product.subcategory;
        } else {
            subcategoryGroup.style.display = 'none';
            productSubcategory.value = '';
        }

        formTitle.textContent = 'Editar Producto';
        submitBtn.textContent = 'Guardar Cambios';
    }

    // Manejar la eliminación de un producto
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