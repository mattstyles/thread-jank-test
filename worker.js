
var data

onmessage = function( event ) {
    for( var i = 0; i < event.data.data.length; i++ ) {
        event.data.data[ i ] = event.data.data[ i ] % 0xff
    }

    for( var i = 0; i < event.data.data.length; i++ ) {
        event.data.data[ i ] = [
            event.data.data[ Math.random() * event.data.data.length ],
            event.data.data[ Math.random() * event.data.data.length ],
            event.data.data[ Math.random() * event.data.data.length ],
            event.data.data[ Math.random() * event.data.data.length ]
        ].reduce( function( prev, curr ) {
            return ( prev + curr ) / 2
        })
    }

    postMessage({
        status: 200,
        msg: 'from thread',
        data: event.data.data
    })
}
