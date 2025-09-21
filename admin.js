const supabaseUrl = 'https://ucjnlylxjaezfgbmckkg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjam5seWx4amFlemZnYm1ja2tnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NDIyOTksImV4cCI6MjA3MzExODI5OX0.N3QoSWDDAkEQ811oOV97aalQTuH25i2bYHHZ0TQt2q0';
const supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);

document.addEventListener('DOMContentLoaded', () => {
    const productForm = document.getElementById('product-form');
    const productName = document.getElementById('product-name');
    const productDescription = document.getElementById('product-description');
    const productPrice = document.getElementById('product-price');
    const productImage = document.getElementById('product-image');
    const productCategory = document.getElementById('product-category');
    const productSubcategory = document.getElementById('product-subcategory');
    const subcategoryGroup = document.getElementById('subcategory-group');
    const productStock = document.getElementById('product-stock');
    const logoutBtn = document.getElementById('logout-btn');
    const formTitle = document.getElementById('form-title');
    const productId = document.getElementById('product-id');
    const submitBtn = document.getElementById('submit-btn');

    productCategory.addEventListener('change', () => {
        if (productCategory.value === 'Cocina') {
            subcategoryGroup.style.display = 'block';
            productSubcategory.innerHTML = '<option value="">Selecciona una subcategoría</option>';
            ['Organizadores', 'Vajillas', 'Jarras/Botellas'].forEach(sub => {
                const option = document.createElement('option');
                option.value = sub;
                option.textContent = sub;
                productSubcategory.appendChild(option);
            });
        } else {
            subcategoryGroup.style.display = 'none';
        }
    });

    async function loadProductForEdit() {
        const urlParams = new URLSearchParams(window.location.search);
        const productIdToEdit = urlParams.get('edit');

        if (!productIdToEdit) return;

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

    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const isEditing = productId.value !== '';
        
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
        };

        if (isEditing) {
            if (imageUrls.length > 0) {
                productData.image_url = imageUrls;
            }

            const { error } = await supabase
                .from('products')
                .update(productData)
                .eq('id', productId.value);

            if (error) {
                console.error('Error al actualizar el producto:', error);
                alert('Error al actualizar el producto.');
            } else {
                alert('Producto actualizado con éxito!');
                window.location.href = 'mis_productos.html'; // Redirigir a la nueva página
            }
        } else {
            productData.image_url = imageUrls;

            const { error } = await supabase
                .from('products')
                .insert([productData]);

            if (error) {
                console.error('Error al agregar el producto:', error);
                alert('Error al agregar el producto.');
            } else {
                alert('¡Producto agregado con éxito!');
                productForm.reset();
                subcategoryGroup.style.display = 'none';
            }
        }
    });

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

    loadProductForEdit();
});