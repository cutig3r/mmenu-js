Mmenu.addons.navbars=function(){var i=this,n=this.opts.navbars;if(void 0!==n){n instanceof Array||(n=[n]);var c={},d={};n.length&&(n.forEach(function(n){"boolean"==typeof n&&n&&(n={}),"object"!=typeof n&&(n={}),void 0===n.content&&(n.content=["prev","title"]),n.content instanceof Array||(n.content=[n.content]);var a=Mmenu.$('<div class="mm-navbar" />'),t=n.height;"number"!=typeof t?t=1:1<(t=Math.min(4,Math.max(1,t)))&&a.addClass("mm-navbar_size-"+t);var e=n.position;switch(e){case"bottom":break;default:e="top"}c[e]||(c[e]=0),c[e]+=t,d[e]||(d[e]=Mmenu.$('<div class="mm-navbars_'+e+'" />')),d[e].append(a);for(var o=0,s=n.content.length;o<s;o++){var r="string"==typeof n.content[o]&&Mmenu.addons.navbars[n.content[o]]||null;r?r.call(i,a):((r=n.content[o])instanceof Mmenu.$||(r=Mmenu.$(n.content[o])),a.append(r))}a.children(".mm-btn").length&&a.addClass("mm-navbar_has-btns");var m="string"==typeof n.type&&Mmenu.addons.navbars[n.type]||null;m&&m.call(i,a)}),this.bind("initMenu:after",function(){for(var n in c)i.node.menu.classList.add("mm-menu_navbar_"+n+"-"+c[n]),Mmenu.$(i.node.menu)["bottom"==n?"append":"prepend"](d[n])}))}},Mmenu.options.navbars=[],Mmenu.configs.navbars={breadcrumbs:{separator:"/",removeFirst:!1}},Mmenu.configs.classNames.navbars={};