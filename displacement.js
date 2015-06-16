/**
 * Worker thread
 */

/**
 * @input Uint8Array map
 * @input width
 * @input height
 * @output Uint8Array
 */

var map, height, width

function to1d( x, y ) {
    return ( y * width ) + x
}

function wrapX( num ) {
    var min = 0
    var max = width - 1

    if ( num > max ) {
        return num % max
    }

    if ( num < min ) {
        return max - ( ( min - num ) % ( max - min ) )
    }

    return num
}

function wrapY( num ) {
    var min = 0
    var max = height - 1

    if ( num > max ) {
        return num % max
    }

    if ( num < min ) {
        return max - ( ( min - num ) % ( max - min ) )
    }

    return num
}

function get( x, y ) {
    return map[ to1d( wrapX( x ), wrapY( y ) ) ]
}

function set( x, y, value ) {
    map[ to1d( wrapX( x ), wrapY( y ) ) ] = value & 0xff
}



/**
 * Returns +-127
 */
function variance() {
    return -0x80 + ( Math.random() * 0xff )
}


/**
 * Total variance * smoothness * step
 * Step decreases with each fold to produce a better result
 */
function getMidpointDisplacement( size ) {
    return variance() * 1 * ( size / ( width - 1 ) )
}

/**
 * Averages (mean) all values passed as args
 */
function getAvg() {
    return Array.prototype.reduce.call( arguments, function( prev, num ) {
        return prev + num
    }) / arguments.length
}

/**
 * Grabs the average of each edge point
 */
function getAvgEdge( x1, y1, x2, y2 ) {
    var size = ~~( x2 - x1 ) / 2
    return getAvg(
        get( x1 + size, y1 ),
        get( x1, y1 + size ),
        get( x2, y1 + size ),
        get( x1 + size, y2 )
    )
}

/**
 * Grabs the average from each corner point
 */
function getAvgCorner( x1, y1, x2, y2 ) {
    return getAvg(
        get( x1, y1 ),
        get( x2, y1 ),
        get( x1, y2 ),
        get( x2, y2 )
    )
}

/**
 * Get average from a central point
 */
function getAvgPoint( x, y, size ) {
    return getAvg(
        get( x, y - size ),
        get( x + size, y ),
        get( x - size, y ),
        get( x, y + size )
    )
}

/**
 * @param cb <function> iterator to call
 * @param step <float> 0...1
 */
function iterate( cb, step ) {
    var size = ( width - 1 ) * step
    for ( var x = 0; x < width - 1; x += size ) {
        for ( var y = 0; y < height - 1; y += size ) {
            cb( x, y, size )
        }
    }
}

/**
 * Starts the generation
 * @private
 * @param step <float:optional> the step value or 1
 */
function generate( step ) {
    if ( !step ) {
        step = 1
    }
    var size = ( width - 1 ) * step


    iterate( generateSquare, step )
    iterate( generateDiamond, step )


    if ( size > 2 ) {
        generate( step / 2 )
        return
    }

    //this.emit( 'done' )
    done()
}





/**
 * Performs the square step - generating a point in the center
 * @param x <number> x component of top-left corner
 * @param y <number> y component of top-left corner
 * @param size <number> size of square to calculate mid-point of
 */
function generateSquare( x, y, size ) {
    var mid = size / 2
    var avg = getAvgCorner( x, y, x + size, y + size )
    set( x + mid, y + mid, avg + getMidpointDisplacement( size ) )
}

/**
 * Performs the diamond step - generating points at the edges
 * @param x <number> x component of top-left corner
 * @param y <number> y component of top-left corner
 * @param size <number> size of square to calculate edges of
 */
function generateDiamond( x, y, size ) {
    var mid = size / 2

    var setCell = function( xx, yy ) {
        var avg = getAvgPoint( xx, yy, mid )
        //console.log( 'setting diamond point', xx, yy, avg, 'for', x, y, size )
        set( xx, yy, avg + getMidpointDisplacement( size ) )
    }

    setCell( x + mid, y )
    setCell( x + mid, y + size )
    setCell( x, y + mid )
    setCell( x + size, y + mid )
}











this.addEventListener( 'message', function( event ) {
    map = event.data.map
    height = event.data.height
    width = event.data.width

    generate( 1 )
})

function done() {
    this.postMessage({
        map: map
    })
}
