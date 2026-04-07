// Estado da aplicação
let products = [];
let currentCategory = "all";
let searchQuery = "";

// Elementos do DOM
const productsContainer = document.getElementById("productsContainer");
const searchInput = document.getElementById("searchInput");
const categoryBtns = document.querySelectorAll(".category-btn");

// Inicializar aplicação
function init() {
  carregarCards();
  setupEventListeners(); // Ativa os ouvintes de clique e digitação
}

async function carregarCards() {
  try {
    const resposta = await fetch("json/dados.json");
    const json = await resposta.json();
    // Ajustado para a estrutura do seu JSON (json.dados)
    products = json.dados || [];
    renderProducts();
  } catch (erro) {
    console.error("Erro ao carregar o JSON:", erro);
  }
}

// Configurar ouvintes de eventos
function setupEventListeners() {
  // Evento de Digitação (Pesquisa Direta)
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value;
      renderProducts();
    });
  }

  // Evento de Clique nos Botões de Categoria
  categoryBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Atualiza visual dos botões
      categoryBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      // Atualiza categoria e renderiza
      currentCategory = btn.dataset.category;
      renderProducts();
    });
  });
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

// Criar card de produto (Apenas Frente)
function createProductCard(product) {
  const card = document.createElement("div");
  // Gera um slug da categoria para cores dinâmicas (ex: "OFF!" -> "off")
  const brandClass = product.categoria.toLowerCase().replace(/[^a-z]/g, "");
  card.className = `product-card ${brandClass}`;

  // Adiciona evento de clique para girar
  card.onclick = () => card.classList.toggle("flipped");

  card.innerHTML = `
    <div class="card-inner">
        <div class="card-front">
            <div class="brand-badge">${product.categoria}</div>
            <div class="product-image">
                <img src="${product.imagem}" alt="${product.nome}" onerror="this.src='https://via.placeholder.com/150'">
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.nome}</h3>
                <div class="product-footer">
                    <span class="product-price">${product.precoOriginal}</span>
                    <span class="product-price">${product.preco || "Consulte"}</span>
                </div>
            </div>
        </div>

        <div class="card-back">
            <div class="back-content">
                <img src="logo/scj-logo.svg" class="mini-logo" alt="SC Johnson">
                <h4>Como usar</h4>
                <p class="usage-text">${product.instrucoes || "Informações de uso disponíveis na embalagem do produto."}</p>
                <div class="back-footer">
                    <span>Toque para voltar</span>
                </div>
            </div>
        </div>
    </div>
  `;

  return card;
}

// Iniciar quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", init);
