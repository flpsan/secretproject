var ceps = [ 90150001 ];

var validateCadastroSenha = function(isOnChange) {
  if ($('.form-cadastro #senha input').val().length == 0) {
    if (isOnChange) {
      $('.form-cadastro #senha').vazio();
    } else {
      $('.form-cadastro #senha').invalido('Campo obrigatório');
    }
    return;
  }
  if ($('.form-cadastro #senha input').val().length < 6) {
    $('.form-cadastro #senha').invalido('Mínimo 6 caracteres');  
  } else {
    $('.form-cadastro #senha').valido();
  }    
};

var validateCadastroConfirmacaoSenha = function(isOnChange) {
  if ($('.form-cadastro #confirmacao-senha input').val().length == 0) {
    if (isOnChange) {
      $('.form-cadastro #confirmacao-senha').vazio();
    } else {
      $('.form-cadastro #confirmacao-senha').invalido('Campo obrigatório');
    }
    return;
  }
  if (!$('.form-cadastro #senha').isValido()) {
    $('.form-cadastro #confirmacao-senha').invalido('Primeira senha inválida');
  } else if ($('.form-cadastro #confirmacao-senha input').val() != $('.form-cadastro #senha input').val()) {
    $('.form-cadastro #confirmacao-senha').invalido('Confirmação diferente da senha');  
  } else {
    $('.form-cadastro #confirmacao-senha').valido();
  }    
};

var validateCadastroNome = function(isOnChange) {
  if ($('.form-cadastro #nome input').val().length == 0) {
    if (isOnChange) {
      $('.form-cadastro #nome').vazio();
    } else {
      $('.form-cadastro #nome').invalido('Campo obrigatório');
    }
    return;
  }
  var arr = $('.form-cadastro #nome input').val().split(' ');
  if ($('.form-cadastro #nome input').val().split(' ').length < 2) {
    $('.form-cadastro #nome').invalido('Digite seu nome completo');  
  } else if (arr[0].length < 2 || arr[1].length < 2) {
    $('.form-cadastro #nome').invalido('Digite seu nome completo'); 
  } else {
    $('.form-cadastro #nome').valido();
  }
};

var validateCadastroEmail = function(isOnChange) {  
  if ($('.form-cadastro #email input').val().length == 0) {
    if (isOnChange) {
      $('.form-cadastro #email').vazio();
    } else {
      $('.form-cadastro #email').invalido('Campo obrigatório');
    }
    return;
  }
 
  var regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (regex.test($('.form-cadastro #email input').val())) {
    $('.form-cadastro #email').valido();  
  } else {
    $('.form-cadastro #email').invalido('Email inválido');  
  }
};

var validateCadastroCep = function(e, isOnChange) {  
  if ($('.form-cadastro #cep input').val().length == 0) {
    if (isOnChange) {
      $('.form-cadastro #cep').vazio();
    } else {
      $('.form-cadastro #cep').invalido('Campo obrigatório');
    }
    return;
  } 
  
  var cep = $('.form-cadastro #cep input').cleanVal();
  if (cep.length === 8) {
    if (ceps.indexOf(parseInt(cep)) === -1) {
      $('.form-cadastro #cep').invalido('Desculpe, não atendemos neste CEP');
      return;
    } else {
      $('.form-cadastro #cep').valido();      
    }
  } else {
    $('.form-cadastro #cep').invalido('CEP deve possuir 8 números');
  }
};

var validateCadastroDefaultInput = function(obj, isOnChange, obrigatorio) {
  if ($(obj).val().length == 0) {
    if (isOnChange) {
      $(obj).closest('.input').vazio();
    } else if (obrigatorio) {
      $(obj).closest('.input').invalido('Campo obrigatório');
    }
    return;
  }
  $(obj).closest('.input').valido();
};