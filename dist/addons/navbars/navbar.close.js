import * as DOM from '../../_modules/dom';
import * as sr from '../../_modules/screenreader';
export default function (navbar) {
    /** The close button. */
    const close = DOM.create('a.mm-btn.mm-btn--close.mm-navbar__btn');
    //	Add the button to the navbar.
    navbar.append(close);
    //	Add screenreader support.
    close.append(sr.text(this.i18n(this.conf.screenReader.text.closeMenu)));
    //	Update to target the page node.
    this.bind('setPage:after', (page) => {
        close.setAttribute('href', '#' + page.id);
    });
}