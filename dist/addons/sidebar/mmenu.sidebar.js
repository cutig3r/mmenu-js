Mmenu.addons.sidebar=function(){var e=this;if(this.opts.offCanvas){var n=this.opts.sidebar;("string"==typeof n||"boolean"==typeof n&&n||"number"==typeof n)&&(n={expanded:n}),"object"!=typeof n&&(n={}),"boolean"==typeof n.collapsed&&n.collapsed&&(n.collapsed={use:"all"}),"string"!=typeof n.collapsed&&"number"!=typeof n.collapsed||(n.collapsed={use:n.collapsed}),"object"!=typeof n.collapsed&&(n.collapsed={}),"number"==typeof n.collapsed.use&&(n.collapsed.use="(min-width: "+n.collapsed.use+"px)"),"boolean"==typeof n.expanded&&n.expanded&&(n.expanded={use:"all"}),"string"!=typeof n.expanded&&"number"!=typeof n.expanded||(n.expanded={use:n.expanded}),"object"!=typeof n.expanded&&(n.expanded={}),"number"==typeof n.expanded.use&&(n.expanded.use="(min-width: "+n.expanded.use+"px)"),this.opts.sidebar=Mmenu.extend(n,Mmenu.options.sidebar);var d="mm-wrapper_sidebar-collapsed",s="mm-wrapper_sidebar-expanded";n.collapsed.use&&(this.bind("initMenu:after",function(){e.node.menu.classList.add("mm-menu_sidebar-collapsed"),n.collapsed.blockMenu&&e.opts.offCanvas&&!Mmenu.$(e.node.menu).children(".mm-menu__blocker").length&&Mmenu.$(e.node.menu).prepend('<a class="mm-menu__blocker" href="#'+e.node.$menu[0].id+'" />'),n.collapsed.hideNavbar&&e.node.menu.classList.add("mm-menu_hidenavbar"),n.collapsed.hideDivider&&e.node.menu.classList.add("mm-menu_hidedivider")}),"boolean"==typeof n.collapsed.use?this.bind("initMenu:after",function(){Mmenu.$("html").addClass(d)}):this.matchMedia(n.collapsed.use,function(){Mmenu.$("html").addClass(d)},function(){Mmenu.$("html").removeClass(d)})),n.expanded.use&&(this.bind("initMenu:after",function(){e.node.menu.classList.add("mm-menu_sidebar-expanded")}),"boolean"==typeof n.expanded.use?this.bind("initMenu:after",function(){Mmenu.$("html").addClass(s),e.open()}):this.matchMedia(n.expanded.use,function(){Mmenu.$("html").addClass(s),Mmenu.$("html").hasClass("mm-wrapper_sidebar-closed")||e.open()},function(){Mmenu.$("html").removeClass(s),e.close()}),this.bind("close:start",function(){Mmenu.$("html").hasClass(s)&&Mmenu.$("html").addClass("mm-wrapper_sidebar-closed")}),this.bind("open:start",function(){Mmenu.$("html").removeClass("mm-wrapper_sidebar-closed")}),this.clck.push(function(e,n){if(n.inMenu&&n.inListview&&Mmenu.$("html").hasClass("mm-wrapper_sidebar-expanded"))return{close:!1}}))}},Mmenu.options.sidebar={collapsed:{use:!1,blockMenu:!0,hideDivider:!1,hideNavbar:!0},expanded:{use:!1}};