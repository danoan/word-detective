export let routing = function(){

  function genericError(req,res){
    res.status(500);
    let errorMessage = "Oups, something unexpected occurred and we are sorry for that. Give it another try later ;)"
    res.render('errors/generic-error.ntl', { vars: { errorMessage } });
  }

  return {
    genericError
  };
}();
