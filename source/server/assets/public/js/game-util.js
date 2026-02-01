class MyError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = this.constructor.name;
    this.cause = cause
  }
}

export class NoPuzzleGenerated extends MyError { };
export class MissingResource extends MyError { };

export function setDefaultConfiguration(config) {
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

export function showUI(){
  setTimeout( function(){
    document.getElementById("container-loading").style.display = "none";
    document.getElementById("container-main").style.display = "block";
  },250);
}

export class DateGen {}

//Static properties is a recent addition to the language.
//For Dec/2021, works only in Chrome.
DateGen.DateFormula = {
  "OneYearFromNow": Symbol("OneYearFromNow"),
  "TomorrowMidnight": Symbol("TomorrowMidnight"),
  "TodayMidnight": Symbol("TodayMidnight"),
  "TenMinutesFromNow": Symbol("TenMinutesFromNow")
}

DateGen.generate = function(date_formula) {
  let today = new Date();
  today.setHours(0);
  today.setMinutes(0);
  today.setSeconds(0);
  today.setMilliseconds(0);

  if (date_formula == DateGen.DateFormula.OneYearFromNow) {
    return new Date(today.getTime() + 360 * 24 * 60 * 60 * 1000);
  } else if (date_formula == DateGen.DateFormula.TomorrowMidnight) {
    return new Date(today.getTime() + 24 * 60 * 60 * 1000);
  } else if(date_formula == DateGen.DateFormula.TodayMidnight){
    return today;
  } else if(date_formula == DateGen.DateFormula.TenMinutesFromNow){
    let now = new Date();
    return new Date(now.getTime() + 1000 * 60 * 10);
  }
}

const LANGUAGES = ["pt","en","it","fr"];

export function identifyLanguage(){
  for(let language of LANGUAGES){
    if(document.baseURI.includes(`/${language}`)){
      return language;
    }
  }
  return "pt";
}

export function gotoFromBaseURI(path){
  document.location.href=`${document.baseURI}/${path}`;
}

export async function loadGameSettings(config) {
  try {
    let response = await fetch('/api/game-settings');
    let settings = await response.json();
    for (let key in settings) {
      config[key] = settings[key];
    }
  } catch (e) {
    // Settings unavailable — keep defaults
  }
}
