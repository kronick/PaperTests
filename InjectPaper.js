paper.install(window);

window.onload = function() {
    // Get a reference to the canvas object
    var canvas = document.getElementById('canvas');
    // Create an empty project and a view for the canvas:
    paper.setup(canvas);
    
    var tool = new Tool();
    kickoff();
    
    //paper.view.draw();
}