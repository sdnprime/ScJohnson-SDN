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
                    <span class="product-price">De: R$ ${product.precoOriginal.toFixed(2).replace(".", ",")}</span>
                    <span class="product-price">${product.preco}</span>
                </div>
            </div>
        </div>
    </div>
  `;

  return card;
}

// Iniciar aplicação quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", init);
