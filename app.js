var express = require('express'), app = express();
var passport = require('passport');
app.use(require('express-session')({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));
var path = require("path");
var LocalStrategy = require('passport-local').Strategy;
var sqlite = require('sqlite-sync');
var validator = require('validator');
var flp = require('./flp-module');

app.set('view engine', 'pug');

app.use(express.static('public'));
app.use(passport.initialize());
app.use(passport.session());

var retornoX = flp.deserializarCompra('1;2;3#4;6;7');
if (retornoX.ok) {
  console.log(retornoX.dados);
} else {
  console.log(retornoX.mensagem.paraLog);
}


sqlite.connect('myDatabase.db');
var categorias = sqlite.run("SELECT * FROM categoria");
var subcategorias = sqlite.run("select (select count(subcategoria) from produto p where p.subcategoria = s.id) as quantidade_produtos, c.id as id_categoria, s.id as id_subcategoria, c.nome as nome_categoria, s.nome as nome_subcategoria from categoria c inner join subcategoria s on c.id=s.id_categoria");

console.log(subcategorias);

sqlite.close();
    

passport.use(new LocalStrategy(
  function(username, password, done) {
    sqlite.connect('myDatabase.db');
    var rows = sqlite.run("SELECT * FROM usuario where usuario = '"+username+"'");
    sqlite.close();
    if (rows.length > 0) {
        if (rows[0].senha === password) {
            return done(null, username);  
        } else {
            return done(null, false, { message: 'Senha inválida.' });
        }
    }
    return done(null, false, { message: 'Usuário inexistente.' });
    
  }
));

passport.serializeUser(function(user, done) {
	done(null, user);
});

passport.deserializeUser(function(obj, done) {
	done(null, obj);
});




//--- MIDDLEWARES -----
var deveEstarLogadoMiddleware = function(req, res, next){
  if (!req.isAuthenticated()) { return res.status(401).end(); }
  next();
};

var variaveisTelaMiddleware = function(req, res, next){
  req.app.locals.templateVars = {
    logado: req.isAuthenticated(),
    user: req.user,
    categorias: categorias,
    subcategorias: subcategorias,
    serverDate: new Date()
  };
  next();
};

var somenteAceitaAjax = function(req, res, next){
  if (!req.xhr) { 
    return res.status(404).end(); 
  }
  next();
};



app.get('/get-produto', variaveisTelaMiddleware, function(req, res){
    var sql = "select *, printf('%d,%02d', valor/100, valor%100) AS valor_formatado from produto";
    sql += flp.montarWhere(sql, 'id', req.query.id, 'IN');
    sqlite.connect('myDatabase.db');
    console.log(sql);
    var produtos = sqlite.run(sql);
    sqlite.close();
    res.send(produtos);
});


//--- ROTAS -----
app.get('/', variaveisTelaMiddleware, function(req, res){
	res.render('index', req.app.locals.templateVars);
});

app.get('/produtos', variaveisTelaMiddleware, function(req, res){
    if (req.query.categoria === undefined) {
      return res.status(400).end('Categoria é um parâmetro obrigatório.');
    }
    var categoria = categorias.find(function(categoria){return categoria.id == req.query.categoria});
    if (categoria === undefined) {
      return res.status(400).end('Categoria inexistente.');
    }
    req.app.locals.templateVars.categoria = categoria;
    
    if (req.query.subcategoria !== undefined && req.query.subcategoria !== '') {
      var subcategoria = subcategorias.find(function(subcategoria){return subcategoria.id_categoria == req.query.categoria && subcategoria.id_subcategoria == req.query.subcategoria});
      req.app.locals.templateVars.subcategoria = subcategoria;
      if (subcategoria === undefined) {
        return res.status(400).end('Subcategoria inexistente');
      }
    }
  
    var sql = "select *, printf('%d,%02d', valor/100, valor%100) AS valor_formatado from produto";
    sql += flp.montarWhere(sql, 'categoria', req.query.categoria);
    sql += flp.montarWhere(sql, 'subcategoria', req.query.subcategoria);
    sqlite.connect('myDatabase.db');
    var produtos = sqlite.run(sql);
    sqlite.close();
    
    if (produtos.length === 0) {
      req.app.locals.templateVars.erro = true;
      req.app.locals.templateVars.mensagem = 'Nenhum produto encontrado.';
    } else {
      req.app.locals.templateVars.produtos = produtos;
    }
    
    res.render('produtos', req.app.locals.templateVars);
});

app.get('/cadastro', variaveisTelaMiddleware, function(req, res){
  res.render('cadastro', req.app.locals.templateVars);
});

app.get('/salvar-compra', variaveisTelaMiddleware, function(req, res){
	res.render('carrinho', req.app.locals.templateVars);
});

app.get('/logout', somenteAceitaAjax, function(req, res){
	req.session.destroy();
	req.logout();
  res.end();
});

var requisicoesDeLogin = {};

app.get('/login', somenteAceitaAjax, 
  function(req, res) {
    if (!(req.connection.remoteAddress in requisicoesDeLogin)) {
        requisicoesDeLogin[req.connection.remoteAddress] = [ ];
    }
    var arr = requisicoesDeLogin[req.connection.remoteAddress];
    var now = new Date().getTime();
    if (arr.length > 0) {
        var lastLogin = arr[arr.length-1];
        var difMs = now - lastLogin;
        console.log('dif: ' + difMs);
        if (difMs < 4000) {
            return res.status(401).send({message:'Requisição negada. Muitas tentativas de logins em sequência.'});     
        }
    }
    requisicoesDeLogin[req.connection.remoteAddress].push(now);
    console.log(requisicoesDeLogin);
    if (!req.query.username) {
      return res.status(401).send({message:'Usuário não informado.'});
    }
    if (!req.query.password) {
      return res.status(401).send({message:'Senha não informada.'});
    }
    passport.authenticate('local', function(err, user, info) {
      if (err) { return res.status(500).send(info); console.log('6 '+err); }
      if (!user) { return res.status(401).send(info); console.log('7'+info); }
      req.login(user, function(err) {
        if (err) { 
          return res.status(500).send(info);
        }
        return res.send(user);
      });
    })(req, res);
  });
//-------------------------------------------

var server = app.listen(3000);
console.log('Servidor Express iniciado na porta %s', server.address().port);