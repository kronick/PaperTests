paper.install(window);

window.onload = function() {
    // Get a reference to the canvas object
    var canvas = document.getElementById('canvas');
    var canvasContainer = $('#canvas').parent();
    // Create an empty project and a view for the canvas:
    paper.setup(canvas);
    
    var tool = new Tool();
    kickoff();
    
    var dataURL = canvas.toDataURL("image/jpeg");
    //console.log(dataURL);
    //document.getElementById('canvasImg').src = dataURL;
    
    //paper.view.draw();
}