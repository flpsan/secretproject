var forms = {
  initForms: function() {
    /** Esconde todos os sufixos de input **/
    $('.sufixo').hide(); 
    /** Aplica padding nos inputs que possuem sufixos **/
    $('.input .sufixo').siblings('input').css('padding-left', '1.5em'); 
    /** Seta default size dos inputs para 1 **/
    $('input').attr('size', 1); 
    /** Monta todos contadores nos inputs que o possuem **/
    $.each($('input[contador]'), function(){ $('<label class=\'contador\'><span class=\'atual\'>0</span>/<span class=\'max\'>'+$(this).prop('maxlength')+'</span></label>').insertAfter($(this)); });
    /** Roda callback inputFocusCallback nos inputs para forçar a posição correta do placeholder e do sufixo desde o início **/
    $('.input input').each(inputFocusCallback);
  },
  
  bindGenericEvents: function() {
    /** Binda evento click para limpar formulários nos botões .limpar **/
    $(".limpar").on('click', function() { $(this).closest('.form').find("input").limpar(); });
    /** Binda eventos de foco nos inputs para correta manipulação do placeholder e do sufixo **/
    $('.input input').on('focusin focusout input', inputFocusCallback);
    /** Binda eventos de change nos inputs que possuem contador para sua correta atualização em tempo real **/
    $('[contador]').on('change keyup input', function(e){ $(this).siblings('.contador').find('.atual').html($(this).val().length); });
  },
  
  initCadastroForm: function() {
    $('.form-cadastro .limpar').click(); /** Força evento de clique no botão .limpar do cadastro **/
    
    /** Máscaras **/
    $('.form-cadastro #cep input').mask('00000-000');
    $('.form-cadastro #telefone1 input').mask('(00) 000000000');
    $('.form-cadastro #telefone2 input').mask('(00) 000000000');
  },
  
  bindCadastroEvents: function() {  
    $('.form-cadastro #email input').on('change', onChangeCadastroEmail);
    $('.form-cadastro #nome input').on('change', onChangeCadastroNome);
    $('.form-cadastro #senha input').on('change', onChangeCadastroSenha);
    $('.form-cadastro #confirmacao-senha input').on('change', onChangeCadastroConfirmacaoSenha);
    $('.form-cadastro #cep input').on('change', onChangeCadastroCep);
    $('.form-cadastro #numero input').on('change', onChangeCadastroDefaultInputObrigatorio);
    $('.form-cadastro #complemento input').on('change', onChangeCadastroDefaultInputOpcional);
    $('.form-cadastro #telefone1 input').on('change', onChangeCadastroDefaultInputObrigatorio);
    $('.form-cadastro #telefone2 input').on('change', onChangeCadastroDefaultInputOpcional);
    $('.form-cadastro .salvar').on('click', function(){
      if ($('.form-cadastro .loading').length > 0) {
        alert('Aguarde o carregamento do endereço.');
        return;
      }
      validateCadastroEmail(false);
      validateCadastroNome(false);
      validateCadastroSenha(false);
      validateCadastroConfirmacaoSenha(false);
      validateCadastroCep(false);
      validateCadastroDefaultInput($('.form-cadastro #numero input'), false, true);
      validateCadastroDefaultInput($('.form-cadastro #telefone1 input'), false, true);
      if ($('.form-cadastro .erro').length > 0) {
        alert('cadastro contém erros');
        return;
      }
      var param = {};
      $('.form-cadastro .input').each(function(k, obj) { 
        var val = $(obj).find('input').val();
        var id = $(obj).attr('id');
        if (id === 'cep') {
          val = $(obj).find('input').cleanVal();
        }
        param[id] = val;
      });
      console.log(param);
    });
  },
  
  submitCadastro: function() {
    
  }
}