
const inputHandler = {
    W: false,
    S: false,
    D: false,
    A: false
}

window.onkeydown = function(e) {
    if(e.key === 'w') {
        inputHandler.W = true;
    } else if(e.key === 's') {
        inputHandler.S = true;
    } else if(e.key === 'd') {
        inputHandler.D = true;
    } else if(e.key === 'a') {
        inputHandler.A = true;
    }
}
window.onkeyup = function(e) {
    if(e.key === 'w') {
        inputHandler.W = false;
    } else if(e.key === 's') {
        inputHandler.S = false;
    } else if(e.key === 'd') {
        inputHandler.D = false;
    } else if(e.key === 'a') {
        inputHandler.A = false;
    }
}
document.getElementById("mobile-forward").ontouchstart = function(e) {
    e.preventDefault();
    inputHandler.W = true;
}
document.getElementById("mobile-forward").ontouchend = function() {
    inputHandler.W = false;
}
document.getElementById("mobile-backward").ontouchstart = function(e) {
    e.preventDefault();
    inputHandler.S = true;
}
document.getElementById("mobile-backward").ontouchend = function() {
    inputHandler.S = false;
}

export { inputHandler }