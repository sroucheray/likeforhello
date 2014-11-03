var ledController = require("../app/ledController")();

ledController.blink({
    loop: 3,
    duration: 500
});
