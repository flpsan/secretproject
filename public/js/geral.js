var VERSAO = '1_0_6';

$(document).ready(function(){
    $('[data-toggle="tooltip"]').tooltip();
    if (!navigator.cookieEnabled) {
      alert('Para acessar este site é necessário habilitar os cookies.');
    }
    $('.horario-titulo').mouseenter(
      function() {
        $('.card-hidden-box').removeAttr('hidden');
      }
    );
    $('.horario-titulo').mouseleave(
      function() {
        $('.card-hidden-box').attr('hidden', 'hidden');
      }
    );  
    if (logado) { 
      carrinho.inicializarComCookies(function (){
        if (carrinho.produtos.length > 0) {
          mostrarCarrinhoFloat(); /** carrinho-float.js **/
        } 
      });
    }
  }
);

function logar(){
  $.ajax({
    url: '/login',
    data: { username: $('#username').val(), password: $('#password').val() },
    success: function(info){
      setTimeout(
        function(){
          $('#logado').hide('fast');
          $('#deslogado').show('fast');
          $('#user-marcador').html(info);
          logado = true;
          usuario = info;
          carrinho.inicializarComCookies(function(){
            if (carrinho.produtos.length > 0) {
              mostrarCarrinhoFloat(); /** carrinho-float.js **/
            } 
          });
        }, 300);
    }
  });
}
function logout(){
  $.ajax({
    url: '/logout',
    success: function(info){
      setTimeout(
        function(){
          $('#logado').show('fast');
          $('#deslogado').hide('fast');
          logado = false;
          usuario = undefined;
          carrinho.limpar(); /** Limpa carrinho.produtos **/
          carrinho.limparTela(); /** Limpa produtos renderizados **/
          esconderCarrinhoFloat(); /** carrinho-float.js **/
        }, 300);
    }
  });
}

var Produto = {
  get id() { return this._id },
  get valorTela() { return this._valorTela; },
  get subtotal() { return this._valorTela * this._quantidade; },
  get quantidade() { return this._quantidade; },
  set quantidade(value) { this._quantidade = value; },
  instanciarComJson: function(json, quantidade) {
    this._id = parseInt(json.id);
    this._valorTela = parseInt(json.valor);
    this._quantidade = parseInt(quantidade);
    return this;    
  },
  instanciarComCookie: function(sProduto){
    this._id = parseInt(sProduto.split(cookies.DELIMITADOR_ITEM)[0]);
    this._valorTela = parseInt(sProduto.split(cookies.DELIMITADOR_ITEM)[1]);
    this._quantidade = parseInt(sProduto.split(cookies.DELIMITADOR_ITEM)[2]);
    return this;
  },
  toString: function(){
    return [this.id, this.valorTela, this.quantidade].join(cookies.DELIMITADOR_ITEM);
  }
}

var util = {
  aguarde: function(msg) {
    msg = msg || 'Aguarde.';
    console.log('aguarde()');
    $('<div />').attr('id','dvAguarde').html(msg).css({
      'font-size': '20px',
      'position': 'fixed',
      'left': '0',
      'top': '0',
      'width': '100%',
      'height': '100%',
      'background-color': 'black',
      'opacity': '.8',
      'color': 'white',
      'padding': '40%'}
      ).appendTo('body');
  },
  esconderAguarde: function() {
    console.log('esconderAguarde()');
    $('#dvAguarde').detach();
  },
  moeda: function(valor) {
    var tmp = valor+'';
    tmp = tmp.replace(/([0-9]{2})$/g, ",$1");
    if( tmp.length > 6 )
            tmp = tmp.replace(/([0-9]{3}),([0-9]{2}$)/g, ".$1,$2");
    return 'R$ ' + tmp;
  }
}

/**
 * Comunicação com a base de dados.
**/
var sqlite = {
  listarProdutos: function (ids, sucessCallback, errorCallback) {
    util.aguarde();
    $.ajax({
      url: '/get-produto?id=' + ids,
      success: sucessCallback,
      error: errorCallback
    });
  }
}

/** 
 * Armazena informações dos produtos a fim de evitar consultas desnecessárias à base de dados. 
**/
var storage = {
  _storage: window.localStorage, //TODO: check availiability
  EXPIRATION: 1, /** Tempo em minutos para um produto expirar no storage. **/
  
  /**
   * @private
  **/
  _key: function(id) {
    return 'produto_' + id;
  },
  
  contains: function (id) {
    return storage._storage.getItem(storage._key(id)) !== null;
  },

  isValido: function (id) {
    var produto = storage.get(id);
    if (!('data_de_inclusao' in produto)) {
      console.log('Produto #' + id + ' sem data_de_inclusao.');
      return false;
    }
    var dataDeInclusaoDoProduto = new Date(produto.data_de_inclusao);
    var serverDateDeslocada = new Date(serverDate.getTime());
    var deslocamentoEmMinutos = serverDateDeslocada.getMinutes() - storage.EXPIRATION;
    serverDateDeslocada.setMinutes(deslocamentoEmMinutos);
    var produtoExpirado = dataDeInclusaoDoProduto.getTime() < serverDateDeslocada.getTime();
    if (produtoExpirado) {
      console.log('Produto #' + id + ' expirado.');
      return false;
    }
    return true;
  }, 
  
  teste: function() {
    console.log('---------------------');
    console.log('--- storage.teste ---');
    var id = Math.floor(Math.random() * (10)) + 1
    console.log('id: ' + id);
    var values = [], keys = Object.keys(storage._storage), i = keys.length;
    while ( i-- ) {
        console.log(keys[i] + ': ' + storage._storage.getItem(keys[i]));
    }
    console.log('serverDate: ' + serverDate.toLocaleString());
    var serverDateDeslocada = new Date(serverDate.getTime());
    var min = serverDateDeslocada.getMinutes() - storage.EXPIRATION;
    serverDateDeslocada.setMinutes(min);
    console.log('serverDateDeslocada: ' + serverDateDeslocada.toLocaleString());
    console.log('serverDate: ' + serverDate.toLocaleString());
    var datesTest = [ new Date(2017,8-1,27,20,10),
                      new Date(2017,8-1,28,20,10),
                      new Date(2017,8-1,28,20,48),
                      new Date(2017,8-1,28,20,54),
                      new Date(2017,8-1,29,22,10) ];
    $.each(datesTest, function(k, data){
      var auxString;
      var expirado = data.getTime() < serverDateDeslocada.getTime();
      if (expirado) {
        auxString = k + ': [expirado] ' + data.toLocaleString() + ' < ' + serverDateDeslocada.toLocaleString();        
      } else {
        auxString = k + ': ' + data.toLocaleString() + ' > ' + serverDateDeslocada.toLocaleString();
      }
      console.log(auxString);
    });
    console.log('--- storage.teste ---');
    console.log('---------------------');
  },
  
  remove: function (id) {
    return true; //TODO
  },

  get: function (id) {
    return JSON.parse(storage._storage.getItem(storage._key(id)));
  },
  
  /**
   * Adiciona um produto no storage.
   * @param {JSON} Produto em formato JSON.
  **/
  add: function(produto) {
    var item = {
      data_de_inclusao: serverDate.toString(), 
      produto: produto 
    };
    storage._storage.setItem(storage._key(produto.id), JSON.stringify(item));
  }
}

var cookies = {
  ITENS_LINHA_COOKIE: 3,
  DELIMITADOR_LINHA: '#',
  DELIMITADOR_ITEM: ';',
  
  /** Chave do cookie do carrinho. É baseada no usuário logado. **/
  key: function() {
    if (typeof usuario != undefined) {
      return 'carrinho_' + VERSAO + '_' + usuario;
    }
    console.error('Não é possível obter a chave dos cookies de um usuário deslogado.');
  },
  
  /** Retorna os cookies do usuário **/
  get: function() {
    if (typeof usuario != undefined) {
      return Cookies.get(cookies.key());
    }
  },
  
  /** Atualiza os cookies o usuário com o carrinho. **/
  update: function() {
    if (typeof usuario != undefined) {
      Cookies.set(cookies.key(), carrinho.toString());
    }
  },
  
  isValido: function() {
    var isValido = true;
    var cookie = Cookies.get(cookies.key());
    var arrCookie = cookie.split(cookies.DELIMITADOR_LINHA);
    $.each(arrCookie, function (key, linhaCookie) {
      if (linhaCookie.split(cookies.DELIMITADOR_ITEM).length != cookies.ITENS_LINHA_COOKIE) {
        console.log('cookie inválido');
        Cookies.remove(cookies.key());
        isValido = false;
      }
    });
    return isValido;
  },
  
  exists: function() {
    var cookie = Cookies.get(cookies.key());
    if (cookie === undefined) {
      return false;
    }
    if (cookie === null) {
      return false;
    }
    if (cookie === '') {
      return false;
    }
    return true;
  },
  
  limpar: function() {
    if (typeof usuario != undefined) {
      Cookies.remove(cookies.key());
    }
  }
}

var carrinho = {
  produtos: [],
  
  /** 
   * Verifica se existe um produto em {carrinho.produtos}.
   * @return {boolean}
  **/
  contains: function (id) {
    return carrinho.obter(id) != null;
  },
  
  /** 
   * Obtém produto de carrinho.produtos. 
   * @return {Produto}
  **/
  obter: function(id){
    var retorno = null;
    $.each(carrinho.produtos, function(key, produto){
      if (produto.id == id) {
        retorno = produto;
        return true;
      }
    });
    return retorno;
  },
  
  /** 
   * Adiciona um produto ao carrinho.produtos a partir de um cookie.
   * É chamado quando o carrinho é populado no load de uma página e não com o clique no botão de adição de um produto.
   *
   * @param {string} cookieProduto - Informações de um produto que foi adicionado no carrinho no formato 
   * [id];[valor_tela];[quantidade].
  **/
  addDosCookies : function (cookieProduto){
    console.log('carrinho.addDosCookies(cookieProduto)');
    var produto = Object.create(Produto).instanciarComCookie(cookieProduto);
    if (carrinho.contains(produto.id)) {
      /** Situação inesperada, quando é inicializado dos cookies os produtos são únicos. **/
      console.error('Situação inesperada. [carrinho.contains(produto.id)]');
    } else {
      carrinho.produtos.push(produto);
    }
    cookies.update();
  },
  
  /** 
   * Adiciona um produto ao carrinho.produtos a partir da tela.
   * É chamado quando o carrinho é populado pelo clique em um botão.
   *
   * @param {string} json - String no formato JSON com informações do produto adicionado.
   * @param {number} quantidade - Quantidade de produtos a ser adicionada.
  **/
  addDaTela: function (json, quantidade) {
    quantidade = quantidade | 1;
    var produto = Object.create(Produto).instanciarComJson(JSON.parse(json), quantidade | 1);   
    if (carrinho.contains(produto.id)) {
      produto = carrinho.obter(produto.id);
      produto.quantidade += quantidade | 1;
      if (quantidade > 0) {
        carrinho.render({tipo: 'ADICIONAR-QUANTIDADE', id: produto.id});
      } else {
        carrinho.render({tipo: 'REMOVER-QUANTIDADE', id: produto.id});
      }
    } else {
      if (produto.quantidade > 0) {
        carrinho.produtos.push(produto);
        carrinho.render({tipo: 'ADICIONAR-PRODUTO', id: produto.id});
      }
    }    
    if (produto.quantidade <= 0) {
      carrinho.remover(produto.id);
      carrinho.render({tipo: 'REMOVER-PRODUTO', id: produto.id});
    }
    cookies.update();
  },
  
  /** 
   * Altera a quantidade de um produto no carrinho.
   *
   * @param {number} id - String no formato JSON com informações do produto adicionado.
   * @param {number} quantidade - Quantidade de produtos a ser adicionada ou removida (se for negativo).
  **/
  alterarQuantidade: function(id, quantidade) {
    var removerProduto = quantidade === 0;
    if (carrinho.contains(id)) {
      var produto = carrinho.obter(id);
      if (removerProduto) {
        if (!confirm('Confirma exclusão do produto do carrinho?')) {
          return;
        }
        produto.quantidade = 0;
      } else {
        produto.quantidade += quantidade;
      }
      if (produto.quantidade <= 0) {
        carrinho.remover(id);
        carrinho.render({tipo: 'REMOVER-PRODUTO', id: produto.id});
      } else {
        if (quantidade > 0) {
          carrinho.render({tipo: 'REMOVER-QUANTIDADE', id: produto.id});
        } else {
          carrinho.render({tipo: 'ADICIONAR-QUANTIDADE', id: produto.id});
        }
      }
      cookies.update();
    }
  },
  
  remover: function(id) {
    carrinho.produtos = $.grep(carrinho.produtos, function(produto) {
      if (produto.id == id) { 
        console.log('Produto #' + id + ' removido do carrinho.');
      }
      return produto.id != id;
    });
    cookies.update();
  },
  
  limpar: function() {
    carrinho.produtos = [];
  },

  /** 
   * Inicializa o carrinho a partir dos cookies e o renderiza na tela.
   * É chamado quando o usuário entrou em uma tela que possua carrinho ou após o login.
  **/
  inicializarComCookies: function(fnCallback) {
    console.log('carrinho.inicializarComCookies()');
    
    if (!cookies.exists()) {
      console.log('!cookies.exists()');
      return;
    }
    
    if (!cookies.isValido()) {
      console.log('Cookies inválidos. Limpando cookies do usuário.');
      cookies.limpar();
      return;
    }
    /** Limpa o carrinho para começar a popula-lo. **/
    carrinho.limpar();
    carrinho.limparTela();
    
    var produtosCookies = cookies.get();
    var arrProdutosCookies = produtosCookies.split(cookies.DELIMITADOR_LINHA);
    
    var idsDosProdutosNaoEncontradosNoStorage = [];
    var produtosNaoEncontradosNoStorage = []; /** No formato de cookie. **/
    
    $.each(arrProdutosCookies, function (key, cookieProduto) {
      var arrCookieProduto = cookieProduto.split(cookies.DELIMITADOR_ITEM);
      var id = parseInt(arrCookieProduto[0]);
     
      if (!storage.contains(id)) {
        idsDosProdutosNaoEncontradosNoStorage.push(id);
        produtosNaoEncontradosNoStorage.push(cookieProduto);
        console.log('Produto #' + id + ' não encontrado no storage.');
        return true; /** return true pula para a próxima iteração. **/
      }      
      if (!storage.isValido(id)) {
        idsDosProdutosNaoEncontradosNoStorage.push(id);
        produtosNaoEncontradosNoStorage.push(cookieProduto);
        console.log('Produto #' + id + ' no storage é inválido.');
        storage.remove(id);
        return true; /** return true pula para a próxima iteração. **/
      }
      /** Tudo ocorreu bem com este produto então adiciona no carrinho. **/
      carrinho.addDosCookies(cookieProduto);
      
    });
    
    /** Se todos os produtos foram encontrados no storage pode renderizar o carrinho. **/
    var todosCookiesConvertidosCorretamente = produtosNaoEncontradosNoStorage.length === 0;
    if (todosCookiesConvertidosCorretamente) {
      carrinho.render(); /** Full render. **/
      fnCallback();
      return;
    }    

    /** Inicia procedimentos para buscar os produtos não encontrados no storage na base de dados. **/
    var sucessCallback = function(json) {
      util.esconderAguarde();
      for (var i = 0; i < json.length; i++) {
        var jsonProduto = json[i];
        storage.add(jsonProduto);
        var indexOf = idsDosProdutosNaoEncontradosNoStorage.indexOf(jsonProduto.id);
        idsDosProdutosNaoEncontradosNoStorage.splice(indexOf, 1);
        var produtoArr = produtosNaoEncontradosNoStorage.splice(indexOf, 1); //No formato de linha cookie
        if (Array.isArray(produtoArr) && produtoArr.length == 1) { //splice() retorna um array mesmo se só 1 elemento for encontrado
          var cookieProduto = produtoArr[0];
          carrinho.addDosCookies(cookieProduto);
        }        
      }
      carrinho.render(); /** Full render. **/
      fnCallback();
    };
    var errorCallback = function(json) {
      console.log('Falha ao obter produtos da base de dados.');
      carrinho.limpar(); /** Limpa os produtos do carrinho. **/
      cookies.limpar(); /** Limpa os cookies. **/
    };
    var idsQueryString = idsDosProdutosNaoEncontradosNoStorage.join(',');
    sqlite.listarProdutos(idsQueryString, sucessCallback, errorCallback);
  },

  /**
   * Gera um carrinho em formato de cookie chamando o toString de cada produto do carrinho.
   * @return {string} - Retorna string para cookie.
  **/
  toString: function() {
    var arr = [];
    $.each(carrinho.produtos, function(key, produto){
      arr.push(produto.toString());
    });
    return arr.join(cookies.DELIMITADOR_LINHA);
  },
  
  /*** CONTROLES DE RENDERIZAÇÃO DO CARRINHO ***/
  limparTela: function () {
    $('#carrinho-render').children('.produto').not('[template]').remove();
  },
  
  render: function (acao) {

    var itemRender = function (id){
      var jsonProdutoStorage = storage.get(id).produto;
      var produtoCarrinho = carrinho.obter(id);
      var jCarrinhoItemTela = $('#carrinho-render').children('.produto[template]').clone();
      jCarrinhoItemTela.removeAttr('template');
      jCarrinhoItemTela.find('.nome').html(jsonProdutoStorage.nome);
      jCarrinhoItemTela.find('.valor').html(util.moeda(produtoCarrinho.valorTela));
      jCarrinhoItemTela.find('.descricao').html(jsonProdutoStorage.descricao);
      jCarrinhoItemTela.find('.quantidade').val(produtoCarrinho.quantidade);
      jCarrinhoItemTela.find('.subtotal').html(util.moeda(produtoCarrinho.subtotal));
      jCarrinhoItemTela.find('.img').attr('src', '/img/p/' + id + '.jpg');
      jCarrinhoItemTela.attr('id-produto', id);
      jCarrinhoItemTela.appendTo('#carrinho-render').show('fast');
    }
    
    var fullRender = acao === undefined || acao === null;    
    if (fullRender) { 
      carrinho.limparTela();
      $.each(carrinho.produtos, function(key, produto){
        itemRender(produto.id);
      });
      return;
    } 
    
    var alterar = acao.tipo === 'ADICIONAR-QUANTIDADE' || acao.tipo === 'REMOVER-QUANTIDADE';
    var remover = acao.tipo === 'REMOVER-PRODUTO';
    var adicionar = acao.tipo === 'ADICIONAR-PRODUTO';    
    var id = acao.id; /** id do produto que está sofrendo a ação **/
    if (adicionar) {
      itemRender(id);
      return;
    }    
    var jProduto = $('#carrinho-render').children('.produto[id-produto=' + id + ']');
    if (alterar) {
      var produto = carrinho.obter(id);
      jProduto.find('.quantidade').val(produto.quantidade);
      jProduto.find('.subtotal').html(util.moeda(produto.subtotal));
      return;
    }
    if (remover) {
      jProduto.hide('fast', jProduto.detach);
      return;
    }
  }
};

/** 
 * Altera a quantidade a partir do próprio carrinho-float. 
 * Portanto, sempre vai alterar um produto que já está no carrinho, por consequência nunca adicionará um produto do 0. 
 * Para isso, utilizar o método adicionarProdutoNoCarrinho. 
 **/
function alterarQuantidadeDeProdutoNoCarrinho(id, quantidade) {
  carrinho.alterarQuantidade(id, quantidade);
  if (carrinho.produtos.length == 0) {
    esconderCarrinhoFloat();
  }
}

/** Este método serve para adicionar produtos da tela. Nunca remover. **/
function adicionarProdutoNoCarrinho(obj, quantidade){
  if (logado) {
    if (quantidade <= 0) { return; }
    quantidade = quantidade | 1;
    if (carrinho.produtos.length == 0 && quantidade > 0) {
      mostrarCarrinhoFloat();
    }
    var produto = $(obj).attr('data');
    carrinho.addDaTela(produto);
    storage.add(JSON.parse(produto), quantidade);
  } else {
    $('#username').focus();
    alert('Para iniciar uma compra faça login ou cadastre-se.');
  }
}