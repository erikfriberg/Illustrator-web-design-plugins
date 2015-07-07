#target illustrator
#targetengine "session"

/*
    Grid Script
    Simple Grid Script for illustrator.
    Because this is easier than built in options.

    By: Erik Friberg 2014
*/

//Construct application
function gridplugin(){
    try{
        this.DOC = app.activeDocument;
        this.ACTIVEAB = this.DOC.artboards[this.DOC.artboards.getActiveArtboardIndex()];
    }catch(e){
        alert("No open document found! Please open a document and try again!");
        //ugly exit
        return null;
    }
    this.ABleft = this.ACTIVEAB.artboardRect[0];
    this.ABright = this.ACTIVEAB.artboardRect[2];
    this.ABtop = this.ACTIVEAB.artboardRect[1];
    this.ABbottom = this.ACTIVEAB.artboardRect[3];

    //setup settings file save name
    this.settingsfile = "Gridsettings.json";

    this.originallayer = this.DOC.activeLayer;
    this.gridlayer;

    //Setup defaults
    this.baseline = 20;
    this.baselinestart = 0;
    this.column = 12;
    this.width = 60;
    this.gutter = null;
    this.margins = 300;
    this.columncolor = '33a3ff';
    this.columnguides = true;
    this.baselineguides = true;
}

//Convert to the number style needed for script to work
gridplugin.prototype.convertNumber = function(val){
    val = parseInt( val );
    if(isNaN(val)){
        return null;
    }
    return val;
};

//get string from file
gridplugin.prototype.getFileString = function(){
    var contents;
    var thisFile = new File($.fileName);
    var basePath = thisFile.path;
    var prefPath = basePath+"/"+this.settingsfile;
    var prefFile = new File(prefPath);
    if(prefFile.exists){
        prefFile.open('r');
        return prefFile.read();
    }
    return null;
};

//Check for saved settings
gridplugin.prototype.read = function(settingstxt){
    //Check to see if eval is ok to use (comes from json2.js)
    if (settingstxt !== null) {
        var data = eval(settingstxt);
        //read the data
        this.baseline = data.baseline;
        this.baselinestart = data.baselinestart;
        this.column = data.column;
        this.width = data.width;
        this.gutter = data.gutter;
        this.margins = data.margins;
        this.columncolor = data.columncolor;
        this.columnguides = data.columnguides;
        this.baselineguides = data.baselineguides;
    }
};

//Save current settings
gridplugin.prototype.save = function(){
    var saveSettings = {};
    saveSettings['baseline'] = this.baseline;
    saveSettings['baselinestart'] = this.baselinestart;
    saveSettings['column'] = this.column;
    saveSettings['width'] = this.width;
    saveSettings['gutter'] = this.gutter;
    saveSettings['margins'] = this.margins,
    saveSettings['columncolor'] = this.columncolor;
    saveSettings['columnguides'] = this.columnguides;
    saveSettings['baselineguides'] = this.baselineguides;
    return saveSettings;
};

//write settings
gridplugin.prototype.writeFileString = function(contents){
    var thisFile = new File($.fileName);
    var basePath = thisFile.path;
    var prefPath = basePath+"/"+this.settingsfile;
    var prefFile = new File(prefPath);
    //try to write settings to file
    try{
        prefFile.open('w')
        prefFile.write(contents.toSource());
        return true;
    }catch(e){
        alert("Sorry! We didn't manage to save your settings this time!");
    }
    return false;
};

//create hex colors
gridplugin.prototype.hexcolor = function(hex){

    var hexcolor = new RGBColor();

    //convert short hex to longform
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var bigint = parseInt(hex, 16);
    hexcolor.red = (bigint >> 16) & 255;
    hexcolor.green = (bigint >> 8) & 255;
    hexcolor.blue = bigint & 255;

    return hexcolor;
}

//Switch to original layer
gridplugin.prototype.switchBackLayer = function(){
    this.DOC.activeLayer = this.originallayer;
};

//Setup Grid layer
gridplugin.prototype.setupLayer = function(name){
    this.gridlayer = this.DOC.layers.add();
    this.gridlayer.name = name;
};

//Lock grid layer
gridplugin.prototype.lockGridLayer = function(){
    this.gridlayer.locked = true;
};

//Get user settings
gridplugin.prototype.getusersettings = function(){
    var parent = this;
    //what to return
    var returnvalue = null;
    // Create the window
    var sdiag = new Window("dialog", "Create Guides");
    sdiag.alignChildren = "left";

    // Add panels might want to position differently later like this:
    //[left,top,right,bottom]
    sdiag.cPanel = sdiag.add("panel", undefined, "Columns");
    sdiag.cPanel.alignChildren = "left";

    // Columns settings
    /*sdiag.cPanel.add("statictext", undefined, "Enable columns:");
    sdiag.cPanel.enableColumns = sdiag.cPanel.add(
        "checkbox", undefined, "");
    sdiag.cPanel.enableColumns.value = "selected";*/

    sdiag.cPanel.add("statictext", undefined, "Number of columns:");
    sdiag.cPanel.ncolumns = sdiag.cPanel.add(
        'edittext', undefined, ((this.column == null) ? "" : this.column));
    sdiag.cPanel.ncolumns.characters = 6;

    sdiag.cPanel.add("statictext", undefined, "Width:");
    sdiag.cPanel.width = sdiag.cPanel.add(
        'edittext', undefined, ((this.width == null) ? "" : this.width));
    sdiag.cPanel.width.characters = 6;

    sdiag.cPanel.add("statictext", undefined, "Gutter:");
    sdiag.cPanel.gutter = sdiag.cPanel.add(
        'edittext', undefined, ((this.gutter == null) ? "" : this.gutter));
    sdiag.cPanel.gutter.characters = 6;

    sdiag.cPanel.add("statictext", undefined, "Margins:");
    sdiag.cPanel.margin = sdiag.cPanel.add(
        'edittext', undefined, ((this.margins == null) ? "" : this.margins));
    sdiag.cPanel.margin.characters = 6;

    sdiag.cPanel.columnguides = sdiag.cPanel.add("checkbox", undefined, "\u00A0Draw columns as guides");
    sdiag.cPanel.columnguides.value = this.columnguides;

    //custom draw by Dirk Becker for colored button
    function colorbuttonDraw(){
        with( this ) {
            graphics.drawOSControl();
            graphics.rectPath(0,0,size[0],size[1]);
            graphics.fillPath(fillBrush);
        }
    }
    //color to draw columns in:
    sdiag.cPanel.add("statictext", undefined, "Column fill color:");
    sdiag.cPanel.colorbutton = sdiag.cPanel.add('iconbutton', undefined, undefined, {name:'orange', style: 'toolbutton'});
    sdiag.cPanel.colorbutton.size = [50,20];
    sdiag.cPanel.colorbutton.fillBrush = sdiag.cPanel.colorbutton.graphics.newBrush(sdiag.graphics.BrushType.SOLID_COLOR, [(parseInt(this.columncolor.substr(0,2),16)/255),(parseInt(this.columncolor.substr(2,2),16)/255),(parseInt(this.columncolor.substr(4,2),16)/255)]);
    sdiag.cPanel.colorbutton.onDraw = colorbuttonDraw;

    // Add panels
    sdiag.bPanel = sdiag.add("panel", undefined, "Baseline");
    sdiag.bPanel.alignChildren = "left";

    sdiag.bPanel.add("statictext", undefined, "Baseline height:");
    sdiag.bPanel.baseline = sdiag.bPanel.add(
        'edittext', undefined, ((this.baseline == null) ? "" : this.baseline));
    sdiag.bPanel.baseline.characters = 6;

    sdiag.bPanel.add("statictext", undefined, "Baseline offset:");
    sdiag.bPanel.baselineoffset = sdiag.bPanel.add(
        'edittext', undefined, ((this.baselinestart == null) ? "" :
            this.baselinestart));
    sdiag.bPanel.baselineoffset.characters = 6;

    sdiag.bPanel.baselineguides = sdiag.bPanel.add("checkbox", undefined, "\u00A0Draw baseline as guides");
    sdiag.bPanel.baselineguides.value = this.baselineguides;

    //Buttons
    var buttonGroup = sdiag.add("group");
    buttonGroup.orientation = "row";
    sdiag.quitBtn = buttonGroup.add("button", undefined, "Cancel");
    sdiag.createBtn = buttonGroup.add("button", undefined, "Create Grids");
    sdiag.createBtn.active = true;

    //save values
    savevalues = function(ref){
        //get values
        ref.column = parent.convertNumber(
            String(sdiag.cPanel.ncolumns.text));
        ref.width = parent.convertNumber(
            String(sdiag.cPanel.width.text));
        ref.gutter = parent.convertNumber(
            String(sdiag.cPanel.gutter.text));
        ref.margins = parent.convertNumber(
            String(sdiag.cPanel.margin.text));
        ref.columnguides = sdiag.cPanel.columnguides.value;
        ref.baseline = parent.convertNumber(
            String(sdiag.bPanel.baseline.text));
        ref.baselinestart = parent.convertNumber(
            String(sdiag.bPanel.baselineoffset.text));
        ref.baselineguides = sdiag.bPanel.baselineguides.value;
        //save color properly
        while(ref.columncolor.length < 6){
            ref.columncolor = '0' + ref.columncolor;
        }
    }

    // Event listener for quit button
    sdiag.quitBtn.onClick = function() {
        returnvalue = false;
        sdiag.close();
    };

    // Event listener for color button
    sdiag.cPanel.colorbutton.onClick = function(){
        returnvalue = null;
        sdiag.close();

        //this dumb thing closes the sdiag!
        parent.columncolor = ($.colorPicker(
            parseInt(parent.columncolor,16)).toString(16));
    };

    // Event listener for quit button
    sdiag.createBtn.onClick = function() {
        //return that we got an ok and input from the user
        returnvalue = true;
        sdiag.close();
    };

    //draw the window!
    sdiag.center();
    sdiag.show();
    //save all values before closing the window
    savevalues(parent);
    return returnvalue;
};

//Calculate missing numbers
//Missing width
gridplugin.prototype.widthFromNumber = function(number,area,desiredmargin){
    area = (this.ABright-this.ABleft)-(this.margins*2);
    this.width = area/this.column;
};

//Width from numbers & gutters
gridplugin.prototype.widthFromNumberGutter = function(){
    area = (this.ABright-this.ABleft)-(this.margins*2);
    this.width = (area-(this.gutter*this.column)+this.gutter)/this.column;
};

//Gutter from width & number
gridplugin.prototype.gutterFromNumberWidth = function(){
    area = (this.ABright-this.ABleft)-(this.margins*2);
    this.gutter = (area-(this.width*this.column))/(this.column-1);
    if(this.gutter < 0){
        this.gutter = 0;
    }
};

//recalculate columns
gridplugin.prototype.calculateColumns = function(){
    this.column = Math.floor((this.ABright-this.ABleft-(this.margins*2))/((this.width+this.gutter)-this.gutter));
};

//recaulculate values based on user input
gridplugin.prototype.reCalculate = function(){

    //start by checking if margins are null
    if(this.margins === null){
        this.margins = 0;
    }

    //if nothing is null
    if(this.column !== null && this.width !== null && this.gutter !== null){
        //no calculation needed!
        return true;
    }

    //If we have columns but no width
    if(this.column !== null && this.width === null){
        if(this.gutter !== null){
            //if we have gutter
            this.widthFromNumberGutter();
        }else{
            //if we don't have gutter
            this.gutter = 0;
            this.widthFromNumber();
        }
        return true;
    }

    //If we only have width but no columns
    if(this.width !== null && this.column === null){
        if(this.gutter !== null){
            //if we have gutter
            this.calculateColumns();
        }else{
            //if we don't have gutter
            this.gutter = 0;
            this.calculateColumns();
        }
        return true;
    }

    //If we have width but need to calculate gutters
    if(this.width !== null && this.column !== null && this.gutter === null){
        this.gutterFromNumberWidth();
        return true;
    }

    //we couldn't do anything!
    return false;
};

//Center grid if the grid is uneven(recalculates margins)
gridplugin.prototype.centerGrid = function(){
    this.margins = (this.ABright-this.ABleft-(this.column*(this.width+this.gutter)-this.gutter))/2;
};

//Baseline generation
gridplugin.prototype.drawBaseline = function(){
    //we don't wan't to start anything if there isn't a grid to draw
    if(this.baseline === null){
        return false;
    }

    //if baselinestart isn't defined
    if(this.baselinestart === null){
        this.baselinestart = 0;
    }

    //setup group
    gridB = this.DOC.groupItems.add();
    gridB.name= "Baseline: "+this.baseline;

    for(i=1;i<((this.ABtop-this.ABbottom-this.baselinestart)/this.baseline);i+=1){
        var newgridline = this.DOC.pathItems.add();
        var gridline = newgridline.setEntirePath(
            Array(
                Array(this.ABleft,this.ABtop-this.baselinestart-(i*this.baseline)),
                Array(this.ABright,this.ABtop-this.baselinestart-(i*this.baseline))
                )
            );

        //style
        newgridline.stroked = true;
        newgridline.strokeWeight = 1;
        newgridline.strokeColor = this.hexcolor("000");

        //Sort in group
        newgridline.moveToBeginning(gridB);

        //make guides
        if(this.baselineguides){
            newgridline.guides = true;
        }
    }
    //change opacity
    gridB.opacity = 10;
};


//Column generation
gridplugin.prototype.drawColumn = function(){

    //setup group
    gridC = this.DOC.groupItems.add();
    gridC.name= "Columns width: "+this.width;

    for(i=0;i<((this.ABright-this.ABleft-(this.margins*2))/(this.width+this.gutter));i+=1){

        //calculate position of first object
        var startpos = this.ABleft+this.margins;
        var columnline = this.DOC.pathItems.rectangle(
            this.ABtop,
            startpos+(this.width+this.gutter)*i,
            this.width,
            this.ABtop-this.ABbottom
        );

        //style
        columnline.stroked = false;
        columnline.fillColor = this.hexcolor(this.columncolor);

        //Sort in group
        columnline.moveToBeginning(gridC);
    }

    //change opacity
    gridC.opacity = 5;
};

//Column grid generation
gridplugin.prototype.drawGutter = function(){

    //setup group
    gridG = this.DOC.groupItems.add();
    gridG.name= "Gutter: "+this.gutter;

    for(i=0;i<((this.ABright-this.ABleft-(this.margins*2))/(this.width+this.gutter));i+=1){

        //calculate position of first object
        var startpos = this.ABleft+this.margins;
        var newgridline = this.DOC.pathItems.add();
        var gutterline = newgridline.setEntirePath(
            Array(
                Array(startpos+(this.width+this.gutter)*i,this.ABtop),
                Array(startpos+(this.width+this.gutter)*i,this.ABbottom-this.ABtop)
            )
        );
        //Style
        newgridline.stroked = true;
        newgridline.strokeWeight = 1;
        newgridline.strokeColor = this.hexcolor("000");

        //Sort in group
        newgridline.moveToBeginning(gridG);

        //make guides
        if(this.columnguides){
            newgridline.guides = true;
        }

        if(this.gutter !== 0){
            var newgridline2 = this.DOC.pathItems.add();
            var gutterline2 = newgridline2.setEntirePath(
                Array(
                    Array(startpos+this.width+(this.width+this.gutter)*i,this.ABtop),
                    Array(startpos+this.width+(this.width+this.gutter)*i,this.ABbottom-this.ABtop)
                )
            );
            //Style
            newgridline2.stroked = true;
            newgridline2.strokeWeight = 1;
            newgridline2.strokeColor = this.hexcolor("000");

            //Sort in group
            newgridline2.moveToBeginning(gridG);
            //make guides
            if(this.columnguides){
                newgridline2.guides = true;
            }
        }
    }
    //change opacity
    gridG.opacity = 10;
};


//wrap all the logic in a function to allow direct exit on errors
function guidescript(){
    var pluginobj = new gridplugin();

    //get settings file contents
    pluginobj.read(pluginobj.getFileString());

    //DISCLAIMER: ugly workaround to let the user be able to define colors without having the color picker close both dialog windows!
    //get settings from user
    var confirmed;
    while((confirmed = pluginobj.getusersettings()) == null);

    //if the user canceled
    if(!confirmed){
        return 1;
    }

    //save the new settings
    pluginobj.writeFileString(pluginobj.save());

    //check to see if we have enough information to build a column grid
    if(pluginobj.reCalculate()){
        //Get a nice name, breaking encapsulation, sorry!!!
        pluginobj.setupLayer("Grid: "+pluginobj.column+" column");
        pluginobj.centerGrid();
        pluginobj.drawColumn();
        pluginobj.drawGutter();
    }else if(pluginobj.baseline !== null){
        pluginobj.setupLayer("Baseline grid");
    }

    pluginobj.drawBaseline();
    pluginobj.lockGridLayer();
    pluginobj.switchBackLayer();
    return 0;
};

//begin
guidescript();