#target illustrator

/*
    Round the position of selected object to whole numbers
    Achieve pixel perfection quickly!

    By: Erik Friberg 2014
*/

this.DOC = app.activeDocument;
var currentlayer = this.DOC.selection;

if(currentlayer.length > 0){
    for(var i = 0; i < currentlayer.length; i++){
        currentlayer[i].position =  Array(Math.round(currentlayer[i].position[0]), Math.round(currentlayer[i].position[1]));
    }
}
