/** Manipula placeholders e sufixos nos inputs **/
var inputFocusCallback = function() {
  var placeholder = $(this).siblings('label.placeholder');
  var sufixo = $(this).siblings('.sufixo');
  if ($(this).is(':focus')) {
    placeholder.addClass('float');
    sufixo.show('fast');
  } else {    
    if ($(this).val() != '') {
      placeholder.addClass('float sem-foco');
      sufixo.show('fast');        
    } else {
      placeholder.removeClass('float sem-foco');  
      sufixo.hide('fast');            
    }    
  }
};

var onChangeCadastroSenha = function() {
  $('.form-cadastro #confirmacao-senha').limpar();
  validateCadastroSenha(true);
};

var onChangeCadastroConfirmacaoSenha = function() {
  validateCadastroConfirmacaoSenha(true);
};

var onChangeCadastroNome = function() {
  validateCadastroNome(true)
};

var onChangeCadastroEmail = function() {
  validateCadastroEmail(true);
};

var onChangeCadastroCep = function(e) {
  /** Verifica se o originador do evento é um clique no botão .limpar.
      Se for, deve parar a execução para que não faça a requisição ajax para os correios. **/
  if ('originalEvent' in e) {
    if ('explicitOriginalTarget' in e.originalEvent) {  
      var objetoQueOriginouEvento  = e.originalEvent.explicitOriginalTarget;
      if ($(objetoQueOriginouEvento).is('.limpar')){
        return;
      }
    }
  }
  $('.form-cadastro [from=cep]').limpar(); /** Limpa os inputs que derivam do CEP **/
  validateCadastroCep(e, true);
  if ($('.form-cadastro #cep').isValido()) {
    flp.mostrarAguarde('.form-cadastro #endereco1');
    flp.mostrarAguarde('.form-cadastro #endereco2');
    $('.form-cadastro #cep input').attr('disabled', 'disabled');
    $.ajax({
      url: 'http://correiosapi.apphb.com/cep/' + $(this).cleanVal(),
      dataType: 'jsonp',
      crossDomain: true,
      contentType: "application/json",
    })
    .done(function(endereco, textStatus, jqXHR) {
      var logradouro = endereco.tipoDeLogradouro + ' ' + endereco.logradouro;
      $('.form-cadastro #endereco1 input').val(logradouro).focusout();
      $('.form-cadastro #endereco1').valido();
      var cidade = endereco.bairro + ', ' + endereco.cidade + '-' + endereco.estado;
      $('.form-cadastro #endereco2 input').val(cidade).focusout();
      $('.form-cadastro #endereco2').valido();
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
      $('.form-cadastro #cep').invalido('CEP não encontrado');
    })
    .always(function() {
      flp.esconderAguarde('.form-cadastro #endereco1');
      flp.esconderAguarde('.form-cadastro #endereco2');
      $('.form-cadastro #cep input').removeAttr('disabled', 'disabled');
    });
  }
};

var onChangeCadastroDefaultInputObrigatorio = function() {
  validateCadastroDefaultInput(this, true, true);
};

var onChangeCadastroDefaultInputOpcional = function() {
  validateCadastroDefaultInput(this, true, false);
};