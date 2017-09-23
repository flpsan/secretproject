$(document).ready(function(){
  $('#carrinho-float')
    .mouseenter(function(){  })
    .mouseleave(function(){  });

  $('.manipulacao-carrinho').click(function(){
    var fnToggle = maximizarCarrinhoFloat;
    if ($('.conteudo-carrinho').is(':visible')){
      fnToggle = minimizarCarrinhoFloat;
    }
    fnToggle();
  });
});

var minimizarCarrinhoFloat = function() {
    $('.conteudo-carrinho').hide('fast', function(){ //Esconde o conteúdo do carrinho
      $('#carrinho-float').animate({width: '90px'}); //Diminui largura do carrinho
      var img = $('.info-carrinho-float img');
      img.fadeOut('fast', function () {
          img.attr('src', '/img/seta-left.png'); //Seta imagem
          img.fadeIn('fast');
      });
      $('.info-carrinho-float span').html('Mostrar carrinho'); //Seta texto
    })
  };
  
var maximizarCarrinhoFloat = function() {
  $('#carrinho-float').animate({width: '400px'}, 'fast', function(){ //Aumenta largura do carrinho
      $('.conteudo-carrinho').show('fast'); //Mostra conteúdo
      var img = $('.info-carrinho-float img');
      img.fadeOut('fast', function () {
          img.attr('src', '/img/seta-right.png'); //Seta imagem
          img.fadeIn('fast');
      });
      $('.info-carrinho-float span').html('Esconder carrinho');        
    })
  };
  
var esconderCarrinhoFloat = function() {
  minimizarCarrinhoFloat();
  $('#carrinho-float').hide('fast');
};

var mostrarCarrinhoFloat = function() {
  maximizarCarrinhoFloat();
  $('#carrinho-float').show('fast');  
};


