function setDefaultConfiguration(config) {
  config.fatal_error_handler = function (error) {
    let errorObj = { "errorMessage": error.toString() };
    return fetch('/error/register-error', {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, *cors, same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, *same-origin, omit
      headers: {
        'Content-Type': 'application/json'
      },
      redirect: 'follow', // manual, *follow, error
      referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify(errorObj) // body data type must match "Content-Type" header
    })
      .then(() => document.location.href = "/error/500");
  };
}