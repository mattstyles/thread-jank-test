// Start rotation to check for jank
var icon = document.querySelector( '.js-icon' )
var rotate = 0
var animate = function() {
    icon.style.transform = 'rotate( ' + rotate + 'deg )'
    rotate = ( rotate + 1 ) % 360
    requestAnimationFrame( animate )
}
animate()

// Worker stuff
var code = 'onmessage=function(a){for(var t=0;t<a.data.data.length;t++)a.data.data[t]=a.data.data[t]%255;for(var t=0;t<a.data.data.length;t++)a.data.data[t]=[a.data.data[Math.random()*a.data.data.length],a.data.data[Math.random()*a.data.data.length],a.data.data[Math.random()*a.data.data.length],a.data.data[Math.random()*a.data.data.length]].reduce(function(a,t){return(a+t)/2});postMessage({status:200,msg:"from thread",data:a.data.data})};'
var blob = new Blob( [ code ], {
    type: 'text/javascript'
})
var URI = window.URL.createObjectURL( blob )

// Map generation stuff
var width = 0x41
var height = 0x41
var buf = new ArrayBuffer( width * height )
var ui8 = new Uint8Array( buf )
var mapper = [1,2,3,4,5,6,7,8]


// Canvas stuff
var cellSize = 1
var canvas = document.createElement( 'canvas' )
canvas.setAttribute( 'width', width * cellSize )
canvas.setAttribute( 'height', height * cellSize )
var ctx = canvas.getContext( '2d' )
document.body.appendChild( canvas )

function lerp( value ) {
    return 'rgba( 0, 0, 0, ' + ( value / 0xff ) + ' )'
}

function render( arr ) {
    ctx.clearRect( 0, 0, width * cellSize, height * cellSize )
    for ( var x = 0; x < width; x++ ) {
        for ( var y = 0; y < height; y++ ) {
            ctx.fillStyle = lerp( arr[ ( y * width ) + x ] )
            ctx.fillRect( x * cellSize, y * cellSize, cellSize, cellSize )
        }
    }
}



// Tests functions

function doWork( data ) {
    return new Promise( function( resolve, reject ) {
        for( var i = 0; i < data.data.length; i++ ) {
            data.data[ i ] = data.data[ i ] % 0xff
        }
        for( var i = 0; i < data.data.length; i++ ) {
            data.data[ i ] = [
                data.data[ Math.random() * data.data.length ],
                data.data[ Math.random() * data.data.length ],
                data.data[ Math.random() * data.data.length ],
                data.data[ Math.random() * data.data.length ]
            ].reduce( function( prev, curr ) {
                return ( prev + curr ) / 2
            })
        }
        resolve( data.data )
    })
}


function makeWorker() {
    return new Promise( function( resolve, reject ) {

        var worker = new Worker( 'displacement.js' )
        worker.postMessage({
            map: ui8,
            width: width,
            height: height
        })
        worker.onmessage = function( event ) {
            worker.terminate()
            console.log( event )
            resolve( event.data.map )
        }

    })
}

function makeInlineWorker() {
    return new Promise( function( resolve, reject ) {

        var worker = new Worker( URI )
        worker.postMessage({
            data: ui8
        })
        worker.onmessage = function( event ) {
            worker.terminate()
            resolve( event.data.data )
        }

    })
}

function threaded() {
    var workstart = performance.now()
    Promise.all( mapper.map( makeWorker ) )
        .then( function( res ) {
            console.log( 'threaded' )
            console.log( res )
            console.log( 'duration:', ( performance.now() - workstart ).toFixed( 2 ), 'ms' )

            // Just render first map as a test
            render( res[ 0 ] )
        })
}

function inlineThreaded() {
    var workstart = performance.now()
    Promise.all( mapper.map( makeInlineWorker ) )
        .then( function( res ) {
            console.log( 'inline threaded' )
            console.log( res )
            console.log( 'duration:', ( performance.now() - workstart ).toFixed( 2 ), 'ms' )
        })
}


function async() {
    var asyncstart = performance.now()
    Promise.all( mapper.map( function() {
            return doWork({
                data: ui8
            })
        }))
        .then( function( res ) {
            console.log( 'async' )
            console.log( res )
            console.log( 'duration:', ( performance.now() - asyncstart ).toFixed( 2 ), 'ms' )
        })
}


// attach handlers
document.querySelector( '.js-btnThreaded' ).addEventListener( 'click', function() {
    console.log( 'starting threaded test' )
    threaded()
})
document.querySelector( '.js-btnInlineThreaded' ).addEventListener( 'click', function() {
    console.log( 'starting inline threaded test' )
    inlineThreaded()
})
document.querySelector( '.js-btnAsync' ).addEventListener( 'click', function() {
    console.log( 'starting async test' )
    async()
})
