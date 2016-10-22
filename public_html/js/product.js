// Modelo de produto
var ProductModel = function(name, price, units){
	var self = this;
	this.name = ko.observable(name);
  this.price = ko.observable(Number(price));
	this.units = ko.observable(Number(units));
};

// Modelo da lista de produtos e demais funções
var ProductList = function(){

  var self = this;

	// Controladores dos campos de texto do cadastro de produto
	this.productName = ko.observable("");
	this.productPrice = ko.observable("");
  this.productUnits = ko.observable("");

	// Array com a lista dos produtos
	this.products = ko.observableArray([]);

	// Controlador de foco no campo de nome do produto
	this.productNameFocus = ko.observable(true);

	// Recebe valores do $_SESSION e popula lista de produtos
	$.getJSON("php/load-products.php", function(data) {
    for (var x in data){
      var name = data[x]['name']
      var price = data[x]['price'];
      var units = data[x]['units'];
      self.products.push(new ProductModel(name, price, units));
    }
  });

	// Decrementa estoque do produto (não permite valor abaixo de 0)
	this.decreaseUnit = function(product) {
    if (product.units() > 0) {
      product.units(product.units() - 1);
    }
    self.updateList();
  }

	// Incrementa estoque do produto
  this.increaseUnit = function(product) {
    product.units(product.units() + 1);
    self.updateList();
  }

	// Adiciona novo produto
	this.addProduct = function() {
		// Teste de validação dos dados
		if (self.validateInput(self.productName(), self.productPrice(), self.productUnits())) {
			// Cria novo produto e adiciona à lista
      self.products.push(new ProductModel(self.productName(), self.productPrice(), self.productUnits()));
			// Zera campos de texto
	    self.productName('');
      self.productPrice('');
      self.productUnits('');
			// Retorna foco ao campo nome
      self.productNameFocus(true);
			// Envia lista de produtos ao servidor (registro em $_SESSION)
      var data = ko.toJS(self.products());
      $.post(
        "php/add-product.php", {'data': data}
      );
    }
    else {
      alert("Valores inválidos.");
      self.productNameFocus(true);
    }
	}

	// Atualiza lista de produtos no servidor (usado ao editar estoque)
	this.updateList = function() {
    var data = ko.toJS(self.products());
    $.post(
      "php/add-product.php", {'data': data}
    );
  }

	// NOTA: Permitir vírgula para separação de decimais
	// Formata valor monetário (adiciona "R$" e força duas casas decimais)
	this.formatCurrency = function(value) {
    return "R$" + value().toFixed(2);
  }

	// ORDENAÇÃO DA LISTA DE PRODUTOS
	// NOTA: Corrigir comportamento das setas
	// Array de headers para ordenação da lista
	this.headers = [
    {title:'Nome',sortPropertyName:'name', asc: ko.observable(true), arrowDown: ko.observable(false), arrowUp: ko.observable(false)},
    {title:'Preço',sortPropertyName:'price', asc: ko.observable(true), arrowDown: ko.observable(false), arrowUp: ko.observable(false)},
    {title:'Estoque',sortPropertyName:'units', asc: ko.observable(true), arrowDown: ko.observable(false), arrowUp: ko.observable(false)},
		{title:'Decrementar estoque',sortPropertyName:'units', asc: ko.observable(true), arrowDown: ko.observable(false), arrowUp: ko.observable(false)},
		{title:'Incrementar estoque',sortPropertyName:'units', asc: ko.observable(true), arrowDown: ko.observable(false), arrowUp: ko.observable(false)}
  ];

	// Guarda header ativo (usado na ordenação)
	this.activeSort = self.headers[0];

	// Ordena a lista de acordo com header clicado
	this.sortList = function(header){
		// Checa se header clicado é o ativo e reseta as setas
		if(self.activeSort === header) {
      header.asc = !header.asc;
      header.arrowDown(!header.arrowDown());
      header.arrowUp(!header.arrowUp());
    }
		// Caso não seja o ativo, registra novo ativo e atualiza setas
    else {
      self.activeSort.arrowDown(false);
      self.activeSort.arrowUp(false);
      self.activeSort = header;
      header.arrowDown(true);
    }
		// Guarda nome da propriedade do produto
    var prop = header.sortPropertyName;
		// Cria função de ordem ascendente pela propriedade
    var ascSort = function(a,b){return a[prop]() < b[prop]() ? -1 : a[prop]() > b[prop]() ? 1 : a[prop]() == b[prop]() ? 0 : 0; };
		// Cria função de ordem descendente pela propriedade
    var descSort = function(a,b){return a[prop]() > b[prop]() ? -1 : a[prop]() < b[prop]() ? 1 : a[prop]() == b[prop]() ? 0 : 0; };
		// Alterna entre ascendente e descendente
    var sortFunc = header.asc ? ascSort : descSort;
		// Ordena lista de produtos
    self.products.sort(sortFunc);
  }

	// FILTRAGEM DE DISPONIBILIDADE
	// NOTA: Criar função para deixar html mais limpo
	// Controla status da checkbox de disponibilidade
	this.avail = ko.observable(true);

	// VALIDAÇÃO
	// NOTA: Aumentar segurança
	// Validação de dados (usado pela criação de produto)
	this.validateInput = function(name, price, units) {
    if (name != "" && Number(price) != NaN && Number(price) >= 0 && Number(units) != NaN && Number(units) >= 0) {
      return true;
    }
    return false;
  }
};
