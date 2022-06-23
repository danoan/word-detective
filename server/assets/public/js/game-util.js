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

let root = document.documentElement;
function setPalleteBrazil() {
  root.style.setProperty('--pallete-1', '#00520c');
  root.style.setProperty('--pallete-2', '#f5c800');
  root.style.setProperty('--pallete-3', '#ddecdd');
  root.style.setProperty('--pallete-4', '#1e5fba');
  root.style.setProperty('--pallete-5', '#ffffff');
  root.style.setProperty('--pallete-6', '#dadae5');
  root.style.setProperty('--pallete-7', '#aaaaaa');
}

function setPalleteUsa() {
  root.style.setProperty('--pallete-1', '#F31616');
  root.style.setProperty('--pallete-2', '#A00303');
  root.style.setProperty('--pallete-3', '#000552');
  root.style.setProperty('--pallete-4', '#F3F1F1');
  root.style.setProperty('--pallete-5', '#00087A');
  root.style.setProperty('--pallete-6', '#DADAE5');
  root.style.setProperty('--pallete-7', '#AAAAAA');
}

function setPalleteItaly() {
  root.style.setProperty('--pallete-1', '#CD212A');
  root.style.setProperty('--pallete-2', '#008C45');
  root.style.setProperty('--pallete-3', '#F3F1F1');
  root.style.setProperty('--pallete-4', '#A71B22');
  root.style.setProperty('--pallete-5', '#FFFFFF');
  root.style.setProperty('--pallete-6', '#dadae5');
  root.style.setProperty('--pallete-7', '#aaaaaa');
}

function setPalleteUnique() {
  root.style.setProperty('--pallete-1', '#003a4f');
  root.style.setProperty('--pallete-2', '#d1d1af');
  root.style.setProperty('--pallete-3', '#ebebe6');
  root.style.setProperty('--pallete-4', '#003a4f');
  root.style.setProperty('--pallete-5', '#FFFFFF');
  root.style.setProperty('--pallete-6', '#dadae5');
  root.style.setProperty('--pallete-7', '#aaaaaa');
}

const LANGUAGES = ["pt","en","it"];

export function updatePallete(language) {
  setPalleteUnique();
  return;
  if (language === 'pt') setPalleteBrazil();
  else if (language === 'en') setPalleteUsa();
  else if (language === 'it') setPalleteItaly();
}

export function identifyPallete(){
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
