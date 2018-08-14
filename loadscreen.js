var hash = window.location.hash;
console.log('anchor of url ' + hash)

var mixerIO = io('http://localhost:3000/production', {
    transports: ['websocket']
})

mixerIO.on('connect', function() {
    console.log('mixer control connected')
    tryRedirect()
})

mixerIO.on('disconnect', function() {
    console.log('mixer control disconnected')
})


var paymentIO = io('http://localhost:8080/invoices', {
    transports: ['websocket']
});

paymentIO.on('connect', function() {
    console.log('payment service connected')
    tryRedirect()
})

paymentIO.on('disconnect', function() {
    console.log('payment service disconnected')
})


function tryRedirect() {
    if (mixerIO.connected && hash.includes('admin')) {
        window.location.replace("http://localhost:3000/admin#2");
    }
    else if (mixerIO.connected && paymentIO.connected) {
        window.location.replace("http://localhost:3000/");
    }
    else {
        // pass
    }
}
