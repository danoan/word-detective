export function cookie_manager(cookie_id, iso_expiration_date) {

  function get(cname) {
    let name = cname + '=';
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
      }
    }
    return '';
  }

  function set(cname, cvalue, iso_date) {
    let expires = '';
    if(iso_date){
      let d = new Date(iso_date);
      expires = 'expires=' + d.toUTCString();
    }
    // document.cookie = cname + '=' + cvalue + ';' + expires + 'domain=.danoan.github.io;path=/;SameSite=None; Secure';
    document.cookie = cname + '=' + cvalue + ';' + expires + 'domain=192.168.1.22;path=/;SameSite=Lax;';
  }

  return {
    get: () => get(cookie_id),
    set: (cvalue) => set(cookie_id, cvalue, iso_expiration_date)
  };
}
