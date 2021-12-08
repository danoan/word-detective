class MyError extends Error {
  constructor(message,cause) {
    super(message);
    this.name = this.constructor.name;
    this.cause = cause
  }
}

class NoPuzzleGenerated extends MyError {};
class MissingResource extends MyError {};

function setDefaultConfiguration(config) {
  config.fatal_error_handler = function (error) {
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
      body: JSON.stringify(error, Object.getOwnPropertyNames(error)) // body data type must match "Content-Type" header
    })
      .then(() => {
        if (error instanceof NoPuzzleGenerated) {
          document.location.href = `/error/no-puzzle-generated?errorMessage=${error.message}`;
        } else {
          document.location.href = "/error/500";
        }
      });
  };
}