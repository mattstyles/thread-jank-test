// Start rotation to check for jank
var icon = document.querySelector( '.js-icon' )
var rotate = 0
var animate = function() {
    icon.style.transform = 'rotate( ' + rotate + 'deg )'
    rotate = ( rotate + 1 ) % 360
    requestAnimationFrame( animate )
}
animate()

var code = 'onmessage=function(a){for(var t=0;t<a.data.data.length;t++)a.data.data[t]=a.data.data[t]%255;for(var t=0;t<a.data.data.length;t++)a.data.data[t]=[a.data.data[Math.random()*a.data.data.length],a.data.data[Math.random()*a.data.data.length],a.data.data[Math.random()*a.data.data.length],a.data.data[Math.random()*a.data.data.length]].reduce(function(a,t){return(a+t)/2});postMessage({status:200,msg:"from thread",data:a.data.data})};'
var blob = new Blob( [ code ], {
    type: 'text/javascript'
})
var URI = window.URL.createObjectURL( blob )


var buf = new ArrayBuffer( 0xff * 0xff )
var ui8 = new Uint8Array( buf )
var mapper = [1,2,3,4,5,6,7,8 ]


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

        var worker = new Worker( 'worker.js' )
        worker.postMessage({
            data: ui8
        })
        worker.onmessage = function( event ) {
            worker.terminate()
            resolve( event.data.data )
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
