// Estado da aplicação
let products = [];
let currentProduct = null;
let editingProductId = null;
let currentCategory = "all";
let searchQuery = "";

// Elementos do DOM
const productsContainer = document.getElementById("productsContainer");
const searchInput = document.getElementById("searchInput");
const categoryBtns = document.querySelectorAll(".category-btn");
const addProductBtn = document.getElementById("addProductBtn");
const productModal = document.getElementById("productModal");
const formModal = document.getElementById("formModal");
const productForm = document.getElementById("productForm");
const formTabs = document.querySelectorAll(".form-tab");
const formTabContents = document.querySelectorAll(".form-tab-content");

// Inicializar aplicação
function init() {
  carregarCards();
  renderProducts();
  setupEventListeners();
}

async function carregarCards() {
  try {
    const resposta = await fetch("json/dados.json");
    const json = await resposta.json();

    // Salvamos os dados no array global 'products'
    // Usamos 'json.dados' porque seu JSON tem essa estrutura
    products = json.dados;

    // Agora que o array 'products' tem conteúdo, chamamos a renderização
    renderProducts();
  } catch (erro) {
    console.error("Erro ao carregar o JSON:", erro);
  }
}

// Renderizar produtos
function renderProducts() {
  const filtered = filterProducts();
  productsContainer.innerHTML = "";

  if (filtered.length === 0) {
    productsContainer.innerHTML =
      '<p style="grid-column: 1/-1; text-align: center; padding: 2rem; color: #6b7280;">Nenhum produto encontrado</p>';
    return;
  }

  filtered.forEach((product) => {
    const card = createProductCard(product);
    productsContainer.appendChild(card);
  });
}

// Filtrar produtos
function filterProducts() {
  const normalizedSearch = searchQuery
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  return products.filter((product) => {
    // Filtro de Categoria
    const matchCategory =
      currentCategory === "all" || product.categoria === currentCategory;

    // Normalização para busca textual
    const prepareText = (text) =>
      (text || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    const nomeProduto = prepareText(product.nome);
    const categoriaProduto = prepareText(product.categoria);

    const matchSearch =
      nomeProduto.includes(normalizedSearch) ||
      categoriaProduto.includes(normalizedSearch);

    return matchCategory && matchSearch;
  });
}

// Criar card de produto
function createProductCard(product) {
  const card = document.createElement("div");
  card.className = "product-card";

  card.innerHTML = `
    <div class="card-inner">
        <div class="card-front">
            <div class="product-image">
                <img src="${product.imagem}" alt="${product.nome}" onerror="this.src='https://via.placeholder.com/150'">
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.nome}</h3>
                <p class="product-category">${product.categoria}</p>
                <div class="product-footer">
                    <span class="product-price">R$ ${product.preco.toFixed(2).replace(".", ",")}</span>
                </div>
            </div>
        </div>
    </div>
  `;

  return card;
}

// Abrir modal de detalhes do produto
function openProductModal(product) {
  currentProduct = product;
  document.getElementById("modalImage").src = product.image;
  document.getElementById("modalTitle").textContent = product.name;
  document.getElementById("modalCategory").textContent =
    `Categoria: ${product.category}`;
  document.getElementById("modalPrice").textContent =
    `R$ ${product.price.toFixed(2)}`;
  document.getElementById("modalDescription").textContent = product.description;

  // Preencher informações nutricionais
  document.getElementById("modalCalories").textContent =
    product.nutritionalInfo.calories;
  document.getElementById("modalProtein").textContent =
    product.nutritionalInfo.protein;
  document.getElementById("modalCarbs").textContent =
    product.nutritionalInfo.carbs;
  document.getElementById("modalFat").textContent = product.nutritionalInfo.fat;
  document.getElementById("modalFiber").textContent =
    product.nutritionalInfo.fiber;
  document.getElementById("modalSodium").textContent =
    product.nutritionalInfo.sodium;

  productModal.classList.add("active");
}

// Fechar modal de detalhes
function closeProductModal() {
  productModal.classList.remove("active");
  currentProduct = null;
}

// Abrir modal de formulário para novo produto
function openFormModal(product = null) {
  editingProductId = product ? product.id : null;
  document.getElementById("formTitle").textContent = product
    ? "Editar Produto"
    : "Novo Produto";
  document.querySelector(".btn-submit").textContent = product
    ? "Salvar Alterações"
    : "Adicionar Produto";

  if (product) {
    document.getElementById("productName").value = product.name;
    document.getElementById("productCategory").value = product.category;
    document.getElementById("productPrice").value = product.price;
    document.getElementById("productImage").value = product.image;
    document.getElementById("productDescription").value = product.description;
    document.getElementById("productCalories").value =
      product.nutritionalInfo.calories;
    document.getElementById("productProtein").value =
      product.nutritionalInfo.protein;
    document.getElementById("productCarbs").value =
      product.nutritionalInfo.carbs;
    document.getElementById("productFat").value = product.nutritionalInfo.fat;
    document.getElementById("productFiber").value =
      product.nutritionalInfo.fiber;
    document.getElementById("productSodium").value =
      product.nutritionalInfo.sodium;
  } else {
    productForm.reset();
  }

  // Ativar primeira aba
  formTabs.forEach((tab) => tab.classList.remove("active"));
  formTabContents.forEach((content) => content.classList.remove("active"));
  formTabs[0].classList.add("active");
  formTabContents[0].classList.add("active");

  formModal.classList.add("active");
}

// Fechar modal de formulário
function closeFormModal() {
  formModal.classList.remove("active");
  editingProductId = null;
  productForm.reset();
}

// Deletar produto
function deleteProduct() {
  if (!currentProduct) return;

  if (confirm(`Tem certeza que deseja deletar "${currentProduct.name}"?`)) {
    products = products.filter((p) => p.id !== currentProduct.id);
    saveProducts();
    closeProductModal();
    renderProducts();
  }
}

// Configurar event listeners
function setupEventListeners() {
  // Botão adicionar produto
  addProductBtn.addEventListener("click", () => openFormModal());

  // Busca
  searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value;
    renderProducts();
  });

  // Filtro de categorias
  categoryBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      categoryBtns.forEach((b) => b.classList.remove("active"));
      e.target.classList.add("active");
      currentCategory = e.target.dataset.category;
      renderProducts();
    });
  });

  // Modal de detalhes
  document
    .getElementById("modalCloseBtn")
    .addEventListener("click", closeProductModal);
  document
    .getElementById("closeModalBtn")
    .addEventListener("click", closeProductModal);
  document.getElementById("editProductBtn").addEventListener("click", () => {
    closeProductModal();
    openFormModal(currentProduct);
  });
  document
    .getElementById("deleteProductBtn")
    .addEventListener("click", deleteProduct);

  // Modal de formulário
  document
    .getElementById("formCloseBtn")
    .addEventListener("click", closeFormModal);
  document
    .getElementById("formCancelBtn")
    .addEventListener("click", closeFormModal);

  // Abas do formulário
  formTabs.forEach((tab, index) => {
    tab.addEventListener("click", () => {
      formTabs.forEach((t) => t.classList.remove("active"));
      formTabContents.forEach((c) => c.classList.remove("active"));
      tab.classList.add("active");
      formTabContents[index].classList.add("active");
    });
  });

  // Envio do formulário
  productForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = {
      name: document.getElementById("productName").value,
      category: document.getElementById("productCategory").value,
      price: parseFloat(document.getElementById("productPrice").value),
      image:
        document.getElementById("productImage").value ||
        "https://via.placeholder.com/200",
      description: document.getElementById("productDescription").value,
      nutritionalInfo: {
        calories: document.getElementById("productCalories").value,
        protein: document.getElementById("productProtein").value,
        carbs: document.getElementById("productCarbs").value,
        fat: document.getElementById("productFat").value,
        fiber: document.getElementById("productFiber").value,
        sodium: document.getElementById("productSodium").value,
      },
    };

    if (editingProductId) {
      // Editar produto existente
      const product = products.find((p) => p.id === editingProductId);
      if (product) {
        Object.assign(product, formData);
      }
    } else {
      // Adicionar novo produto
      const newProduct = {
        id: Date.now().toString(),
        ...formData,
      };
      products.push(newProduct);
    }

    saveProducts();
    closeFormModal();
    renderProducts();
  });

  // Fechar modais ao clicar fora
  productModal.addEventListener("click", (e) => {
    if (e.target === productModal) closeProductModal();
  });

  formModal.addEventListener("click", (e) => {
    if (e.target === formModal) closeFormModal();
  });
}

// Iniciar aplicação quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", init);
