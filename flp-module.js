var validator = require('validator');
var msg = require('./msg');

var RETORNO = function (ok, mensagem, codigo, dados){
  if (typeof mensagem === 'string') {
    this.mensagem = new msg.Mensagem(mensagem);
  } else {
    this.mensagem = mensagem;
  }
  this.ok = ok; 
  this.codigo = codigo; 
  this.dados = dados;
}
var SUCESSO = function(dados) { return new RETORNO(true, 'Sucesso', 0, dados); };
var FALHA = function(msg, codigo) { return new RETORNO(false, msg || 'Falha', codigo); };

exports.SUCESSO = SUCESSO;
exports.FALHA = FALHA;
exports.RETORNO = RETORNO;

console.log('flp.js loaded');

exports.montarWhere = function (sql, colunaSql, campo, tipo) {
  console.log('montarWhere() - sql: ' + sql + ', colunaSql: ' + colunaSql + ', campo: ' + campo);
  var retorno = '';
  if (typeof campo !== 'undefined') {
    if (sql.indexOf('WHERE') === -1) {
      retorno += ' WHERE';
    } else {
      retorno += ' AND';
    }
    
    if (tipo == 'IN') {
      retorno += ' ' + colunaSql + ' IN (' + validator.escape(campo) + ')';
    } else {
      retorno += ' ' + colunaSql + ' = ' + validator.escape(campo);
    }
  }
  return retorno;
}

exports.deserializarCompra = function (compra) {
  console.log('deserializarCompra() - compra: ' + compra);
  
  /* FORMATO DE UMA COMPRA
      produto.id;valor_na_tela;quantidade#produto.id;valor_na_tela;quantidade  */
      
  var quantidadeDeColunasEsperada = 3;
  var insert = '';
  var produtos = compra.split('#');
  for (var i = 0; i<produtos.length; i++) {
    var colunas = produtos[i].split(';');
    if (colunas.length !== quantidadeDeColunasEsperada) {
      return new FALHA(msg.NUM_COLS_INVALIDAS);
    }
    if (!validator.isNumeric(colunas[0]) || !validator.isNumeric(colunas[1]) || !validator.isNumeric(colunas[2])) {
      return new FALHA(msg.NUM_COLS_INVALIDAS);
    }
    if (i>0) {
      insert += ', ';
    }
    insert += '(' + colunas.join(',') + ')';

  }
  return new SUCESSO(insert);  
}