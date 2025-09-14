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

            // Corregido: si image_url es un array, toma la primera imagen; si es un string, úsalo directamente.
            const imageUrl = Array.isArray(product.image_url) ? product.image_url[0] : product.image_url;
            
            productItem.innerHTML = `
                <img src="${imageUrl}" alt="${product.name}" style="width:100%; height:auto;">
                <h3>${product.name}</h3>
                <p>Categoría: ${product.category}${subcategoryDisplay}</p>
                <p>Precio: $${product.price}</p>
                <p>Stock: ${product.stock ? 'Sí' : 'No'}</p>
                <button class="toggle-stock-btn" data-id="${product.id}">${product.stock ? 'Quitar Stock' : 'Agregar Stock'}</button>
                <button class="edit-btn" data-id="${product.id}">Editar</button>
                <button class="delete-btn" data-id="${product.id}">Eliminar</button>
            `;
            productList.appendChild(productItem);
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

    // Manejar el envío del formulario para agregar/editar
    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const isEditing = productId.value !== '';
        
        // Manejar la subida de imágenes
        let imageUrls = [];
        const files = productImage.files;
        if (files.length > 0) {
            for (const file of files) {
                const filePath = `products/${Date.now()}-${file.name}`;
                const { data, error: uploadError } = await supabase.storage.from('products').upload(filePath, file);

                if (uploadError) {
                    console.error('Error al subir la imagen:', uploadError);
                    alert('Error al subir la imagen.');
                    return;
                }
                const publicURL = `${supabaseUrl}/storage/v1/object/public/products/${data.path}`;
                imageUrls.push(publicURL);
            }
        }

        const productData = {
            name: productName.value,
            description: productDescription.value,
            price: parseFloat(productPrice.value),
            category: productCategory.value,
            subcategory: productSubcategory.value || null,
            stock: productStock.checked,
            // Solo actualiza image_url si hay nuevas imágenes
            ...(imageUrls.length > 0 && { image_url: imageUrls })
        };

        if (isEditing) {
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
            const newProduct = { ...productData, image_url: imageUrls };
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

        const selectedCategory = product.category;
        if (selectedCategory === 'Cocina') {
            subcategoryGroup.style.display = 'block';
            productSubcategory.innerHTML = '<option value="">Selecciona una subcategoría</option>';
            ['Organizadores', 'Vajillas', 'Jarras/Botellas'].forEach(sub => {
                const option = document.createElement('option');
                option.value = sub;
                option.textContent = sub;
                productSubcategory.appendChild(option);
            });
            if (product.subcategory) {
                productSubcategory.value = product.subcategory;
            }
        } else {
            subcategoryGroup.style.display = 'none';
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

    // Manejar el cambio de stock
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