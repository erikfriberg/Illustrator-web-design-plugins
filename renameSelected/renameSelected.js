#target illustrator

/*
    Rename selected layers
    Assign to action to rename selected layers with a quick shortcut!

    By: Erik Friberg 2014
*/

this.DOC = app.activeDocument;
var currentlayer = this.DOC.selection;

if(currentlayer.length > 1){
    var newname = prompt("Rename selected layer", "");
    if(newname != null){
        for(var i = 0; i < currentlayer.length; i++){
            currentlayer[i].name =  newname+(i+1);
        }
    }
}else if(currentlayer.length == 1){
    var currentsingle = currentlayer[0];
    var newname = prompt("Rename selected layer", currentsingle.name);
    if(newname != null){
        currentsingle.name =  newname;
    }
}
