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

// Carregar produtos do localStorage ou usar padrão
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
                    <span class="product-price">${product.precoOriginal}</span>
                    <span class="product-price">${product.preco}</span>
                </div>
            </div>
        </div>

        <div class="card-back">
            <h4>${product.categoria}</h4>
        </div>
    </div>
  `;

  return card;
}

// Configurar event listeners
function setupEventListeners() {
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

productsContainer.addEventListener("click", function (e) {
  // Encontra o card que foi clicado
  const card = e.target.closest(".product-card");

  if (!card) return;

  // Se clicar em algum botão ou link dentro do card, não faz o flip
  if (e.target.closest(".btn-action, button, a")) return;

  // Remove o flip de outros cards (opcional, para fechar os outros ao abrir um novo)
  document.querySelectorAll(".product-card").forEach((c) => {
    if (c !== card) c.classList.remove("is-flipped");
  });

  // Alterna a classe no card clicado
  card.classList.toggle("is-flipped");
});
