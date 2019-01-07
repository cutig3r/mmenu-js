Mmenu.addons.setSelected = function(
	this : Mmenu
) {
	var opts = this.opts.setSelected;


	//	Extend shorthand options
	if ( typeof opts == 'boolean' )
	{
		(opts as mmLooseObject) = {
			hover	: opts,
			parent	: opts
		};
	}
	if ( typeof opts != 'object' )
	{
		(opts as mmLooseObject) = {};
	}
	//	Extend shorthand options


	//opts = this.opts.setSelected = jQuery.extend( true, {}, Mmenu.options.setSelected, opts );
	this.opts.setSelected = Mmenu.extend( opts, Mmenu.options.setSelected );


	//	Find current by URL
	if ( opts.current == 'detect' )
	{
		function findCurrent( 
			this : Mmenu,
			url  : string
		) {
			url = url.split( "?" )[ 0 ].split( "#" )[ 0 ];

			var $a = Mmenu.$(this.node.menu).find( 'a[href="'+ url +'"], a[href="'+ url +'/"]' );
			if ( $a.length )
			{
				this.setSelected( $a.parent() );
			}
			else
			{
				var arr = url.split( '/' ).slice( 0, -1 );
				if ( arr.length )
				{
					findCurrent.call( this, arr.join( '/' ) );
				}
			}
		};
		this.bind( 'initMenu:after', () => {
			findCurrent.call( this, window.location.href );
		});

	}

	//	Remove current selected item
	else if ( !opts.current )
	{
		this.bind( 'initListview:after', ( 
			$panel : JQuery
		) => {
			$panel
				.find( '.mm-listview' )
				.children( '.mm-listitem_selected' )
				.removeClass( 'mm-listitem_selected' );
		});
	}


	//	Add :hover effect on items
	if ( opts.hover )
	{
		this.bind( 'initMenu:after', () => {
			this.node.menu.classList.add( 'mm-menu_selected-hover' );
		});
	}


	//	Set parent item selected for submenus
	if ( opts.parent )
	{
		this.bind( 'openPanel:finish', ( 
			$panel : JQuery
		) => {
			//	Remove all
			this.node.$pnls
				.find( '.mm-listitem_selected-parent' )
				.removeClass( 'mm-listitem_selected-parent' );

			//	Move up the DOM tree
			var $parent : JQuery = ($panel[ 0 ] as any).mmParent;
			while ( $parent )
			{
				$parent
					.not( '.mm-listitem_vertical' )
					.addClass( 'mm-listitem_selected-parent' );
			
				$parent = $parent.closest( '.mm-panel' );
				$parent = ($parent[ 0 ] as any).mmParent;
			}
		});

		this.bind( 'initMenu:after', () => {
			this.node.menu.classList.add( 'mm-menu_selected-parent' );
		});
	}
};


//	Default options and configuration.
Mmenu.options.setSelected = {
	current : true,
	hover	: false,
	parent	: false
};
