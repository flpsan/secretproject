var Mensagem = function (publica, paraLog) {
    function param(teste) {
      console.log(teste);
    }
  this.publica = publica;
  this.paraLog = paraLog || publica;
}
exports.Mensagem = Mensagem;

exports.NUM_COLS_INVALIDAS = new Mensagem('Falha de comunicação', 'Colunas inválidas');