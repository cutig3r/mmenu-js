import Mmenu from '../../core/oncanvas/mmenu.oncanvas';
import options from './_options';
import configs from './_configs';
import translate from './translations/translate';
import { extendShorthandOptions } from './_options';
import * as DOM from '../../_modules/dom';
import * as events from '../../_modules/eventlisteners';
import { type, extend } from '../../_modules/helpers';

//  Add the translations.
translate();

//  Add the options and configs.
Mmenu.options.searchfield = options;
Mmenu.configs.searchfield = configs;

export default function(this: Mmenu) {
    var options = extendShorthandOptions(this.opts.searchfield);
    this.opts.searchfield = extend(options, Mmenu.options.searchfield);

    var configs = this.conf.searchfield;

    if (!options.add) {
        return;
    }

    //	Blur searchfield
    this.bind('close:start', () => {
        DOM.find(this.node.menu, '.mm-searchfield').forEach(input => {
            input.blur();
        });
    });

    this.bind('initPanel:after', (panel: HTMLElement) => {
        var searchpanel: HTMLElement = null;

        //	Add the search panel
        if (options.panel.add) {
            searchpanel = initSearchPanel.call(this);
        }

        //	Add the searchfield
        var addTo: HTMLElement[] = null;
        switch (options.addTo) {
            case 'panels':
                addTo = [panel];
                break;

            case 'panel':
                addTo = [searchpanel];
                break;

            default:
                if (typeof options.addTo == 'string') {
                    addTo = DOM.find(this.node.menu, options.addTo);
                } else if (type(options.addTo) == 'array') {
                    addTo = options.addTo;
                }
                break;
        }

        addTo.forEach(form => {
            form = initSearchfield.call(this, form);
            if (options.search && form) {
                initSearching.call(this, form);
            }
        });

        //	Add the no-results message
        if (options.noResults) {
            initNoResultsMsg.call(
                this,
                options.panel.add ? searchpanel : panel
            );
        }
    });

    //	Add click behavior.
    //	Prevents default behavior when clicking an anchor
    this.clck.push((anchor: HTMLElement, args: mmClickArguments) => {
        if (args.inMenu) {
            if (anchor.matches('.mm-searchfield__btn')) {
                //	Clicking the clear button
                if (anchor.matches('.mm-btn_close')) {
                    let form = anchor.closest('.mm-searchfield') as HTMLElement,
                        input = DOM.find(form, 'input')[0] as HTMLInputElement;

                    input.value = '';
                    this.search(input);

                    return true;
                }

                //	Clicking the submit button
                if (anchor.matches('.mm-btn_next')) {
                    let form = anchor.closest('form');
                    if (form) {
                        form.submit();
                    }

                    return true;
                }
            }
        }
    });
}

const initSearchPanel = function(this: Mmenu): HTMLElement {
    var options = this.opts.searchfield,
        configs = this.conf.searchfield;

    var searchpanel = DOM.children(this.node.pnls, '.mm-panel_search')[0];

    //	Only once
    if (searchpanel) {
        return searchpanel;
    }

    searchpanel = DOM.create('div.mm-panel.mm-panel_search.mm-hidden');

    if (options.panel.id) {
        searchpanel.id = options.panel.id;
    }

    if (options.panel.title) {
        searchpanel.setAttribute('data-mm-title', options.panel.title);
        // searchpanel.dataset.mmTitle = options.panel.title; // IE10 has no dataset :(
    }

    var listview = DOM.create('ul');
    searchpanel.append(listview);

    this.node.pnls.append(searchpanel);

    this.initListview(listview);
    this._initNavbar(searchpanel);

    switch (options.panel.fx) {
        case false:
            break;

        case 'none':
            searchpanel.classList.add('mm-panel_noanimation');
            break;

        default:
            searchpanel.classList.add('mm-panel_fx-' + options.panel.fx);
            break;
    }

    //	Add splash content
    if (options.panel.splash) {
        let splash = DOM.create('div.mm-panel__content');
        splash.innerHTML = options.panel.splash;

        searchpanel.append(splash);
    }

    searchpanel.classList.add('mm-panel');
    searchpanel.classList.add('mm-hidden');

    this.node.pnls.append(searchpanel);

    return searchpanel;
};

const initSearchfield = function(
    this: Mmenu,
    wrapper: HTMLElement
): HTMLElement {
    var options = this.opts.searchfield,
        configs = this.conf.searchfield;

    //	No searchfield in vertical submenus
    if (wrapper.parentElement.matches('.mm-listitem_vertical')) {
        return null;
    }

    //	Only one searchfield per panel
    var form = DOM.find(wrapper, '.mm-searchfield')[0];
    if (form) {
        return form;
    }

    function addAttributes(
        element: HTMLElement,
        attr: mmLooseObject | boolean
    ) {
        if (attr) {
            for (var a in attr as mmLooseObject) {
                element.setAttribute(a, attr[a]);
            }
        }
    }

    var form = DOM.create((configs.form ? 'form' : 'div') + '.mm-searchfield'),
        field = DOM.create('div.mm-searchfield__input'),
        input = DOM.create('input') as HTMLInputElement;

    input.type = 'text';
    input.autocomplete = 'off';
    input.placeholder = this.i18n(options.placeholder) as string;

    field.append(input);
    form.append(field);

    wrapper.prepend(form);

    //	Add attributes to the input
    addAttributes(input, configs.input);

    //	Add the clear button
    if (configs.clear) {
        let anchor = DOM.create('a.mm-btn.mm-btn_close.mm-searchfield__btn');
        anchor.setAttribute('href', '#');

        field.append(anchor);
    }

    //	Add attributes and submit to the form
    addAttributes(form, configs.form);
    if (configs.form && configs.submit && !configs.clear) {
        let anchor = DOM.create('a.mm-btn.mm-btn_next.mm-searchfield__btn');
        anchor.setAttribute('href', '#');

        field.append(anchor);
    }

    if (options.cancel) {
        let anchor = DOM.create('a.mm-searchfield__cancel');
        anchor.setAttribute('href', '#');
        anchor.textContent = this.i18n('cancel') as string;

        form.append(anchor);
    }

    return form;
};

const initSearching = function(this: Mmenu, form: HTMLElement) {
    var options = this.opts.searchfield,
        configs = this.conf.searchfield;

    var data: mmLooseObject = {};

    //	In the searchpanel.
    if (form.closest('.mm-panel_search')) {
        data.panels = DOM.find(this.node.pnls, '.mm-panel');
        data.noresults = [form.closest('.mm-panel')];

        //	In a panel
    } else if (form.closest('.mm-panel')) {
        data.panels = [form.closest('.mm-panel')];
        data.noresults = data.panels;

        //	Not in a panel, global
    } else {
        data.panels = DOM.find(this.node.pnls, '.mm-panel');
        data.noresults = [this.node.menu];
    }

    //	Filter out search panel
    data.panels = data.panels.filter(
        panel => !panel.matches('.mm-panel_search')
    );

    //	Filter out vertical submenus
    data.panels = data.panels.filter(
        panel => !panel.parentElement.matches('.mm-listitem_vertical')
    );

    //  Find listitems and dividers.
    data.listitems = [];
    data.dividers = [];
    data.panels.forEach(panel => {
        data.listitems.push(...DOM.find(panel, '.mm-listitem'));
        data.dividers.push(...DOM.find(panel, '.mm-divider'));
    });

    var searchpanel = DOM.children(this.node.pnls, '.mm-panel_search')[0],
        input = DOM.find(form, 'input')[0],
        cancel = DOM.find(form, '.mm-searchfield__cancel')[0];

    input['mmSearchfield'] = data;

    //	Open the splash panel when focussing the input.
    if (options.panel.add && options.panel.splash) {
        events.off(input, 'focus.splash');
        events.on(input, 'focus.splash', evnt => {
            this.openPanel(searchpanel);
        });
    }

    if (options.cancel) {
        //	Show the cancel button when focussing the input.
        events.off(input, 'focus.cancel');
        events.on(input, 'focus.cancel', evnt => {
            cancel.classList.add('mm-searchfield__cancel-active');
        });

        //	Close the splash panel when clicking the cancel button.
        events.off(cancel, 'click.splash');
        events.on(cancel, 'click.splash', evnt => {
            evnt.preventDefault();
            cancel.classList.remove('mm-searchfield__cancel-active');

            if (searchpanel.matches('.mm-panel_opened')) {
                let parents = DOM.children(
                    this.node.pnls,
                    '.mm-panel_opened-parent'
                );
                if (parents.length) {
                    this.openPanel(parents[parents.length - 1]);
                }
            }
        });
    }

    //	Focus the input in the searchpanel when opening the searchpanel.
    if (options.panel.add && options.addTo == 'panel') {
        this.bind('openPanel:finish', (panel: HTMLElement) => {
            if (panel === searchpanel) {
                input.focus();
            }
        });
    }

    //	Search while typing.
    events.off(input, 'input.search');
    events.on(input, 'input.search', (evnt: KeyboardEvent) => {
        switch (evnt.keyCode) {
            case 9: //	tab
            case 16: //	shift
            case 17: //	control
            case 18: //	alt
            case 37: //	left
            case 38: //	top
            case 39: //	right
            case 40: //	bottom
                break;

            default:
                this.search(input);
                break;
        }
    });

    //	Search initially.
    this.search(input);
};

const initNoResultsMsg = function(this: Mmenu, wrapper: HTMLElement) {
    if (!wrapper) {
        return;
    }

    var options = this.opts.searchfield,
        configs = this.conf.searchfield;

    //	Not in a panel
    if (!wrapper.closest('.mm-panel')) {
        wrapper = DOM.children(this.node.pnls, '.mm-panel')[0];
    }

    //	Only once
    if (DOM.children(wrapper, '.mm-panel__noresultsmsg').length) {
        return;
    }

    //	Add no-results message
    var message = DOM.create('div.mm-panel__noresultsmsg.mm-hidden');
    message.innerHTML = this.i18n(options.noResults) as string;

    wrapper.append(message);
};

Mmenu.prototype.search = function(
    this: Mmenu,
    input: HTMLInputElement,
    query: string
) {
    var options = this.opts.searchfield,
        configs = this.conf.searchfield,
        allOptions = this.opts;

    query = query || '' + input.value;
    query = query.toLowerCase().trim();

    var data = input['mmSearchfield'];
    var form: HTMLElement = input.closest('.mm-searchfield') as HTMLElement,
        buttons: HTMLElement[] = DOM.find(form as HTMLElement, '.mm-btn'),
        searchpanel: HTMLElement = DOM.children(
            this.node.pnls,
            '.mm-panel_search'
        )[0];

    /** The panels. */
    var panels: HTMLElement[] = data.panels;

    /** The "no results" messages in a cloned array. */
    var noresults: HTMLElement[] = data.noresults;

    /** The listitems in a cloned array. */
    var listitems: HTMLElement[] = data.listitems;

    /** Tje dividers in a cloned array. */
    var dividers: HTMLElement[] = data.dividers;

    //	Reset previous results
    listitems.forEach(listitem => {
        listitem.classList.remove('mm-listitem_nosubitems');
        listitem.classList.remove('mm-listitem_onlysubitems');
        listitem.classList.remove('mm-hidden');
    });

    if (searchpanel) {
        DOM.children(searchpanel, '.mm-listview')[0].innerHTML = '';
    }

    panels.forEach(panel => {
        panel.scrollTop = 0;
    });

    //	Search
    if (query.length) {
        //	Initially hide all dividers.
        dividers.forEach(divider => {
            divider.classList.add('mm-hidden');
        });

        //	Hide listitems that do not match.
        listitems.forEach(listitem => {
            var text = DOM.children(listitem, '.mm-listitem__text')[0];
            var add = false;

            //  The listitem should be shown if:
            //          1) The text matches the query and
            //          2a) The text is a open-button and
            //          2b) the option showSubPanels is set to true.
            //      or  3a) The text is not an anchor and
            //          3b) the option showTextItems is set to true.
            //      or  4)  The text is an anchor.

            //  1
            if (
                text &&
                DOM.text(text)
                    .toLowerCase()
                    .indexOf(query) > -1
            ) {
                //  2a
                if (text.matches('.mm-listitem__btn')) {
                    //  2b
                    if (options.showSubPanels) {
                        add = true;
                    }
                }
                //  3a
                else if (!text.matches('a')) {
                    //  3b
                    if (options.showTextItems) {
                        add = true;
                    }
                }
                // 4
                else {
                    add = true;
                }
            }

            if (!add) {
                listitem.classList.add('mm-hidden');
            }
        });

        /** Whether or not the query yielded results. */
        var hasResults = listitems.filter(
            listitem => !listitem.matches('.mm-hidden')
        ).length;

        //	Show all mached listitems in the search panel
        if (options.panel.add) {
            //	Clone all matched listitems into the search panel
            let allitems: HTMLElement[] = [];
            if (allOptions.slidingSubmenus) {
                panels.forEach(panel => {
                    let listitems = DOM.filterLI(DOM.find(panel, '.mm-listitem'));
                    listitems = listitems.filter(
                        listitem => !listitem.matches('.mm-hidden')
                    );

                    if (listitems.length) {
                        //  Add a divider to indicate in what panel the listitems were.
                        if (options.panel.dividers) {
                            let divider = DOM.create('li.mm-divider');
                            let title = DOM.find(panel, '.mm-navbar__title')[0];
                            if (title) {
                                divider.innerHTML = title.innerHTML;
                                allitems.push(divider);
                            }
                        }

                        listitems.forEach(listitem => {
                            allitems.push(listitem.cloneNode(true) as HTMLElement);
                        });
                    }
                });
            }
            else {
                //should be one panel
                panels.forEach(panel => {
                    let listitems = DOM.filterLI(DOM.find(panel, '.mm-listitem'));
                    listitems = listitems.filter(
                        listitem => !listitem.matches('.mm-hidden')
                    );

                    if (listitems.length) {
                        if (options.panel.dividers) {
                            const navbarTitle = DOM.find(panel, '.mm-navbar__title')[0];
                            //we want to use the parent list item text if there is one,
                            //otherwise fallback to the navbar title
                            const mappings = listitems.map(listItem => {
                                const titleAncestry:Array<HTMLElement> = [];
                                const parents = DOM.parents(listItem, ".mm-listitem");
                                parents.forEach(parent => {
                                    const title = DOM.find(parent, '.mm-listitem__text')[0];
                                    if (title) {
                                        titleAncestry.push(title);
                                    }
                                });
                                
                                if (navbarTitle) {
                                    titleAncestry.push(navbarTitle);
                                }
                                const title = titleAncestry.length ? titleAncestry[0] : null;
                                return {
                                    item: listItem,
                                    title: title,
                                    titleAncestry: titleAncestry,
                                };
                            });
                            const groupedItemsByTitle = mappings.reduce(
                                function (arr, mapping) {
                                    const matches = arr.filter(x => x.title === mapping.title);
                                    if (!matches.length) {
                                        arr.push({
                                            title: mapping.title,
                                            titleAncestry: mapping.titleAncestry,
                                            items: [mapping.item]
                                        });
                                    }
                                    else {
                                        matches[0].items.push(mapping.item);
                                    }
                                    return arr;
                                },
                                new Array<{title:HTMLElement, titleAncestry:HTMLElement[], items:HTMLElement[]}>()
                            );
                            
                            const flattened = new Array<{title:HTMLElement, items:HTMLElement[]}>();
                            groupedItemsByTitle.forEach(grouped => {
                                if (grouped.titleAncestry.length) {
                                    for (let i = grouped.titleAncestry.length - 1; i >= 1; i--) {
                                        const title = grouped.titleAncestry[i];
                                        const matches = flattened.filter(f => f.title === title);
                                        if (!matches.length) {
                                            flattened.push({
                                                title: title,
                                                items: [],
                                            });
                                        }
                                    }
                                }
                                
                                {
                                    const matches = flattened.filter(f => f.title === grouped.title);
                                    if (matches.length) {
                                        grouped.items.forEach(item => {
                                            matches[0].items.push(item);
                                        });
                                    }
                                    else {
                                        flattened.push({
                                            title: grouped.title,
                                            items: grouped.items.map((x) => x), //create a copy of the array
                                        });
                                    }
                                }
                            });

                            flattened.forEach(flat => {
                                if (flat.title) {
                                    let divider = DOM.create('li.mm-divider');
                                    divider.innerHTML = flat.title.innerHTML;
                                    allitems.push(divider);
                                }
                                flat.items.forEach(item => {
                                    allitems.push(item.cloneNode(true) as HTMLElement);
                                })
                            });
                        }
                        else {
                            listitems.forEach(listitem => {
                                allitems.push(listitem.cloneNode(true) as HTMLElement);
                            });
                        }                       
                    }
                });
            }

            //	Remove toggles and checks.
            allitems.forEach(listitem => {
                listitem
                    .querySelectorAll('.mm-toggle, .mm-check')
                    .forEach(element => {
                        element.remove();
                    });
            });

            //	Add to the search panel.
            DOM.children(searchpanel, '.mm-listview')[0].append(...allitems);

            //	Open the search panel.
            this.openPanel(searchpanel);
        } else {
            //	Also show listitems in sub-panels for matched listitems
            if (options.showSubPanels) {
                panels.forEach(panel => {
                    let listitems = DOM.find(panel, '.mm-listitem');

                    DOM.filterLI(listitems).forEach(listitem => {
                        let child: HTMLElement = listitem['mmChild'];
                        if (child) {
                            DOM.find(child, '.mm-listitem').forEach(
                                listitem => {
                                    listitem.classList.remove('mm-hidden');
                                }
                            );
                        }
                    });
                });
            }

            //	Update parent for sub-panel
            //  .reverse() mutates the original array, therefor we "clone" it first using [...panels].
            [...panels].reverse().forEach((panel, p) => {
                let parent: HTMLElement = panel['mmParent'];

                if (parent) {
                    //	The current panel has mached listitems
                    let listitems = DOM.find(panel, '.mm-listitem');
                    if (DOM.filterLI(listitems).length) {
                        //	Show parent
                        if (parent.matches('.mm-hidden')) {
                            parent.classList.remove('mm-hidden');
                        }
                        parent.classList.add('mm-listitem_onlysubitems');
                    } else if (!input.closest('.mm-panel')) {
                        if (
                            panel.matches('.mm-panel_opened') ||
                            panel.matches('.mm-panel_opened-parent')
                        ) {
                            //	Compensate the timeout for the opening animation
                            setTimeout(() => {
                                this.openPanel(
                                    parent.closest('.mm-panel') as HTMLElement
                                );
                            }, (p + 1) * (this.conf.openingInterval * 1.5));
                        }
                        parent.classList.add('mm-listitem_nosubitems');
                    }
                }
            });

            //	Show parent panels of vertical submenus
            panels.forEach(panel => {
                let listitems = DOM.find(panel, '.mm-listitem');
                DOM.filterLI(listitems).forEach(listitem => {
                    DOM.parents(listitem, '.mm-listitem_vertical').forEach(
                        parent => {
                            if (parent.matches('.mm-hidden')) {
                                parent.classList.remove('mm-hidden');
                                parent.classList.add(
                                    'mm-listitem_onlysubitems'
                                );
                            }
                        }
                    );
                });
            });

            //	Show first preceeding divider of parent
            panels.forEach(panel => {
                let listitems = DOM.find(panel, '.mm-listitem');
                DOM.filterLI(listitems).forEach(listitem => {
                    let divider = DOM.prevAll(listitem, '.mm-divider')[0];
                    if (divider) {
                        divider.classList.remove('mm-hidden');
                    }
                });
            });
        }

        //	Show submit / clear button
        buttons.forEach(button => button.classList.remove('mm-hidden'));

        //	Show/hide no results message
        noresults.forEach(wrapper => {
            DOM.find(wrapper, '.mm-panel__noresultsmsg').forEach(message =>
                message.classList[hasResults ? 'add' : 'remove']('mm-hidden')
            );
        });

        if (options.panel.add) {
            //	Hide splash
            if (options.panel.splash) {
                DOM.find(searchpanel, '.mm-panel__content').forEach(splash =>
                    splash.classList.add('mm-hidden')
                );
            }

            //	Re-show original listitems when in search panel
            listitems.forEach(listitem =>
                listitem.classList.remove('mm-hidden')
            );
            dividers.forEach(divider => divider.classList.remove('mm-hidden'));
        }

        //	Don't search
    } else {
        //	Show all items
        listitems.forEach(listitem => listitem.classList.remove('mm-hidden'));
        dividers.forEach(divider => divider.classList.remove('mm-hidden'));

        //	Hide submit / clear button
        buttons.forEach(button => button.classList.add('mm-hidden'));

        //	Hide no results message
        noresults.forEach(wrapper => {
            DOM.find(wrapper, '.mm-panel__noresultsmsg').forEach(message =>
                message.classList.add('mm-hidden')
            );
        });

        if (options.panel.add) {
            //	Show splash
            if (options.panel.splash) {
                DOM.find(searchpanel, '.mm-panel__content').forEach(splash =>
                    splash.classList.remove('mm-hidden')
                );

                //	Close panel
            } else if (!input.closest('.mm-panel_search')) {
                let opened = DOM.children(
                    this.node.pnls,
                    '.mm-panel_opened-parent'
                );
                this.openPanel(opened.slice(-1)[0]);
            }
        }
    }

    //	Update for other addons
    this.trigger('updateListview');
};
