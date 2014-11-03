var ledController = require("../app/ledController")();

ledController.blink({
    loop: 3,
    duration: 500
});


setTimeout(function() {
    ledController.off();
}, 5000);