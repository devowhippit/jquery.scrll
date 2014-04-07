
( function( $ ) {

    var $scrollparent   = $( '#wrap' );
    var $scrollchildren = $scrollparent.find( '.container' );
    var inviewcount     = 0;
    var timers          = [];
    var delay           = 1000;
    var scrolling       = false;

    $scrollchildren.each( function() {
        if ( $( this ).hasClass( 'inview' ) ) {
            inviewcount = inviewcount++;
        }
    });

    if ( inviewcount === 0 ) {
        $scrollchildren.first().addClass( 'inview' );
    }

    /**
     * Transistions the page to the target div offset top
     * @param  {string} target optional selector for target.
     * @return {null}
     */
    $.fn.focustranslate = function( target ) {
        console.log( target );
        var scrolltop = typeof target === 'undefined' ? -( $( this ).position().top ) : -( $( target ).position().top );
        var translate = 'translate3d( 0 , ' + scrolltop + 'px , 0 )';
        $scrollparent.css( '-webkit-transform' , translate ).css( 'transform' , translate );
    };

    $( document ).ready( function() {

        $( '.nav-translate' ).find( 'li.translate a' ).bind( 'click' , function( event ) {

            event.preventDefault();

            var target = $( this ).attr( 'rel' );

            $( '.inview' ).removeClass( 'inview' );
            $( '.container.' + target ).addClass( 'inview' );
            $( '.inview' ).focustranslate();

        } );

    });

    $( document ).ready().bind( 'mousewheel DOMMouseScroll' , function( event ) {
      
        var delta, next, prev, focal_index;

        delta = event.originalEvent.wheelDelta || -event.originalEvent.detail;

        event.preventDefault();

        if ( scrolling ) { return; }

        focal_index = $scrollparent.find( '.container.inview' ).index();

        $( '.inview' ).removeClass( 'inview' );

        if ( delta < 0 ) {
            next = $scrollchildren.eq( focal_index ).nextAll( '.container:first' );
            next = ( next.length > 0 ) ? next : $scrollchildren.eq( 0 );
            next.addClass( 'inview' );
        } else if ( delta > -0 ) {
            prev = $scrollchildren.eq( focal_index ).prevAll( '.container:first' );
            prev = ( prev.length > 0 ) ? prev : $scrollchildren.eq( $scrollchildren.length - 1 );
            prev.addClass( 'inview' );
        }

        scrolling = true;
        timers[0] = setTimeout( function() { scrolling = false; } , delay );

        $( '.inview' ).focustranslate();

    });

})( jQuery );