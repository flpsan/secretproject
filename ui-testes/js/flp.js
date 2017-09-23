var flp = {
  mostrarAguarde: function(seletor){
    if (seletor === undefined) {
      $('#templates > .overlay, #templates > .overlay > .aguarde').removeClass('hide');
      $('#templates > .overlay > .aguarde').focus();
    } else {
      $('#templates > .loading-template > .loading-overlay').clone().removeClass('hide').appendTo(seletor);
      $('#templates > .loading-template > .loading').clone().removeClass('hide').appendTo(seletor);
    }
  },
  esconderAguarde: function(seletor){
    if (seletor === undefined) {
      $('#templates > .overlay, #templates > .overlay > .aguarde').addClass('hide');
    } else {
      $(seletor + ' .loading').detach();
      $(seletor + ' .loading-overlay').detach();
    }
  }
};

jQuery.fn.extend({
  invalido: function(msg) {
    var msg = 'Erro: ' + (msg || 'Campo inválido');
    var input = $(this).children('input');
    $(this).children('.icon-valido').detach(); 
    $(this).children('input, .placeholder').addClass('erro');
    if ($(this).children('helper erro').length > 0) {
      $(this).children('helper erro').html(msg);
    } else {
      $('<label>').addClass('helper erro').html(msg).insertAfter(input);
    }
  },
  valido: function() {
    if (!$(this).children().is('.icon-valido')){
      $('#templates > .icon-valido').clone().removeClass('hide').insertAfter($(this).children('input'));
    }
    $(this).children('input, .placeholder').removeClass('erro');  
    $(this).children('label.helper.erro').detach();    
  },
  isValido: function() {
    return !$(this).children('input').is('.erro');
  },
  vazio: function () {
    $(this).children('input, .placeholder').removeClass('erro');  
    $(this).children('label.helper.erro, .icon-valido').detach(); 
  },
  limpar: function() {
    if ($(this).is('input')) {
      $(this).closest('.input').vazio();
      $(this).val('').focusout();      
    } else {
      $(this).vazio();
      $(this).children('input').val('').focusout();
    }
  }
});