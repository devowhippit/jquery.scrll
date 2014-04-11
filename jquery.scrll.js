
( function( $ ) {

    if ( typeof Modernizr !== 'undefined' && Modernizr.touch || !Modernizr.csstransforms ) {
        return;
    }

    var $document       = $( document );
    var $window         = $( window );
    var $body           = $( 'body' );
    var inviewcount     = 0;
    var timers          = [];
    var scrll           = false;

    var options = {
        $scrollparent   : $( '#wrap' ),
        $scrollchildren : $( '#wrap' ).find( '.container' ),
        $navtranslate   : $( '.nav-translate' ).find( 'li.translate a' ),
        delay           : 1000,
        scrolling       : false,
        snapToTop       : false,
        snapToBottom    : false,
        sectionClass    : 'container',
        activeClass     : 'inview',
        initIndexFocus  : 1,
        initFocus       : '',
        jqueryAnimSpeed : 450
    };

    options.$scrollchildren.each( function() {
        if ( $( this ).hasClass( options.activeClass ) ) {
            inviewcount = inviewcount++;
            options.initIndexFocus = $( this ).index();
        }
    });

    options.initFocus = options.$scrollchildren.eq( options.initIndexFocus );

    /**
     * Translates the page to the target div offset top.
     * If you don't pass it a target it will use the object
     * the function is bound to. Any selector can be used for
     * the target as long as it is unique.
     * @param  {string} target optional selector for target.
     * @return {null}
     */
    $.fn.focustranslate = function( target ) {
        var scrolltop, translate;
        var $target = typeof target === 'undefined' ? $( this ) : $( target );

        /**
         * Prevents exposing the bottom of the page by making sure the height
         * of the next target and following targets are greater than the window
         * height, otherwise it will scroll to the top of the target.
         */
        if ( $target.height() + $target.nextAll().height() < $window.height() ) {
            scrolltop = -( $target.position().top + $target.height() - $window.height() );
        } else {
            scrolltop = -( $target.position().top );
        }

        /**
         * If Scrolling is bound utilize css smooth scroll,
         * else resort to using jquery animate.
         * @type {[type]}
         */
        if ( scrll === true ) {
            translate = 'translate3d( 0 , ' + scrolltop + 'px , 0 )';
            options.$scrollparent.css( '-webkit-transform' , translate ).css( 'transform' , translate );
        } else {
            $( 'html , body' ).animate( { scrollTop: Math.abs( scrolltop ) + 'px' } , options.jqueryAnimSpeed );
        }

        $( '.scrll-nav' ).find( 'li' ).eq( $target.index() ).addClass( options.activeClass );
    };

    /**
     * Click Event. 
     * Looks for the next target in the rel attribute of click target.
     * Looks for back-to-top rel for jumping to the top of the page.
     * Looks for natural scrolling link for disabling plugin.
     * @return {[type]} [description]
     */
    function clickEvent( event ) {

        event.preventDefault();

        var target = $( this ).attr( 'rel' );

        if ( target === 'natural-scrolling' ) {
            $document.unbindScrll(); return;
        } else if ( target === 'css-scrolling' ) {
            $document.bindScrll(); return;
        }

        $( '.'+options.activeClass ).removeClass( options.activeClass );

        if ( target === 'back-to-top' ) {
            options.$scrollchildren.eq( 0 ).addClass( options.activeClass );
        } else {
            $( '.'+options.sectionClass+'.'+target ).addClass( options.activeClass );
        }

        $( '.'+options.activeClass ).focustranslate();
    }

    /**
     * Scroll Event
     * @param  {[type]} event [description]
     * @return {[type]}       [description]
     */
    function scrllEvent( event ) {

        event.preventDefault();
        var delta, focal_index, focal_difference = 0, $target;

        /**
         * Get the scroll change.
         */
        delta = event.originalEvent.wheelDelta || -event.originalEvent.detail;

        /**
         * Do not scroll if already scrolling.
         */
        if ( options.scrolling ) { return; }

        /**
         * Selects next target.
         * Selects target at the top if at the bottom.
         * Selects target at the bottom if at the top.
         */
        focal_index = options.$scrollparent.find( '.'+options.sectionClass+'.'+options.activeClass ).index() + focal_difference;

        if ( delta < 0 ) {
            $target = options.$scrollchildren.eq( focal_index ).nextAll( '.'+options.sectionClass+':first' );
            $target = ( $target.length === 0 && options.snapToTop ) ? options.$scrollchildren.eq( 0 ) : $target;
        } else if ( delta > -0 ) {
            $target = options.$scrollchildren.eq( focal_index ).prevAll( '.'+options.sectionClass+':first' );
            $target = ( $target.length === 0 && options.snapToBottom ) ? options.$scrollchildren.eq( options.$scrollchildren.length - 1 ) : $target;
        }

        /**
         * Don't Scroll if there is no target.
         */
        if ( $target.length === 0 ) { return; }
        $( '.' + options.activeClass ).removeClass( options.activeClass );
        $target.addClass( options.activeClass );

        /**
         * Reset scrolling var.
         */
        options.scrolling = true;
        timers[ 0 ] = setTimeout( function() { options.scrolling = false; } , options.delay );

        /**
         * Translate to next target.
         */
        $( '.' + options.activeClass ).focustranslate();

    }

    /**
     * [bindScrll description]
     * @return {[type]} [description]
     */
    $.fn.bindScrll = function() {
        $( this ).bind( 'mousewheel DOMMouseScroll' , scrllEvent );
        scrll = true; $body.addClass( 'cssScroll' );

        $( 'html , body' ).animate( { scrollTop: '0px' } , options.jqueryAnimSpeed );
        options.$scrollchildren.eq( options.initIndexFocus ).addClass( options.activeClass );
        $( '.'+options.activeClass ).focustranslate();
    };

    /**
     * [unbindScrll description]
     * @param  {[type]} event [description]
     * @return {[type]}       [description]
     */
    $.fn.unbindScrll = function() {
        $( this ).unbind( 'mousewheel DOMMouseScroll' , scrllEvent );
        scrll = false; $body.removeClass( 'cssScroll' );
        
        $( 'html , body' ).animate( { scrollTop: Math.abs( options.initFocus.position().top ) + 'px' } , options.jqueryAnimSpeed );
        options.$scrollparent.removeAttr( 'style' );
    };

    /**
     * Bind Click Events
     * @return {[type]} [description]
     */
    $.fn.bindClicks = function() {
        $( this ).bind( 'click' , clickEvent );
    };

    /**
     * When the Document is loaded
     * @return {[type]} [description]
     */
    $document.ready( function() {

        options.$navtranslate.bindClicks();
        $( '.scrll' ).bindClicks();
        $( '.scrll-nav' ).find( 'a' ).bindClicks();

    }).bindScrll();

})( jQuery );