var border;
var size, width, height;
var north_c = "none";
var south_c = "none";
var north_adj = 0;
var south_adj = 0;
var screen_height;
var screen_width;
var location_name;
var music = "none";
var kamer;
var stappen;
var canWarp = false;

var warps = {};

var width_north=-1, height_north=-1;
var width_south=-1, height_south=-1;

function loadDataOfPlayer(){
  var rawFile = new XMLHttpRequest();
    rawFile.open("GET", "saveData/player.txt", false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                var lines = rawFile.responseText.split('\n');
                for(var line = 0; line < lines.length; line++){
                  line_txt = lines[line];
                  prop_val = line_txt.split(":");
                  property = prop_val[0];
                  value = prop_val[1];
                  if (property == 'position'){
                    pos = value.split(",");
                    x = parseInt(pos[0]);
                    y = parseInt(pos[1]);
                    console.log('in load data of player');
                    console.log(x);
                    console.log(y);
                    positionPlayer(x,y);
                  }
                }
              }
          }
    }
    rawFile.send(null);
}

function printArray(arrayToPrint) {
    for(var i = 0; i < arrayToPrint.length; i++) {
      for(var z = 0; z < arrayToPrint[i].length; z++) {
        console.log(i + "x" + z + ":" + arrayToPrint[z][i]);
      }
    }
}

function loadLocation(name, start){

  var musicOfLocation= "none";
    //bord clean maken
  emptyLocation();
    
    /*
    
    xmlhttprequest is om data te halen van iets zonder de page te refreshen: hier van een file dus
    
    de ready state zegt waar de request zit (gaat van 0 - 4)
    4 is done
    
    response van de server (hier de file) is de 'status' (200 is request is succesfull -> data kan geread worden)
    
    name is bijvoorbeeld: locations/pt_house1.txt
    
    rawFile.open("GET", name, false);
    false is asynchronous of niet, als false dan zal de code onder de request niet runnen als de request niet klaar is en anders wel (true is recomended maar hier hebben ze voor false gekozen)
    
    rawFile.send(null);
    dit zendt de request naar de file en bij null kan je bv strings schrijven voor een post request: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/send
    
    warp laat het wisselen van map
    
    */
    
  var rawFile = new XMLHttpRequest();
    rawFile.open("GET", name, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                //location_name is dan bv PT HOUSE1
                location_name = name.split(".")[0].replace("_"," ").replace("locations/","").toUpperCase();
                
                //array lines maken met alle commands in om de map te bouwen
                //bv: barrier.png:1,16
                var lines = rawFile.responseText.split('\n');
                
                for(var line = 0; line < lines.length; line++){
                  line_txt = lines[line];
                  prop_val = line_txt.split(":");
                  property = prop_val[0]; //wat het is
                  value = prop_val[1];  //waar het moet staan
                    
                  // zeg nu voor alles hoe je het moet handelen
                  if (property == "border"){
                    border = value;
                  }
                  if (property == "size"){
                    size = value;
                    w_h = size.split("x");
                    width = parseInt(w_h[0]*10);
                    height = parseInt(w_h[1]*10);
                    
                    kamer = new Array(parseInt(w_h[0])+2);
                    for (var i = 0; i < parseInt(w_h[0])+2; i++) {
                      kamer[i] = new Array(parseInt(w_h[1])+2).fill("empty");
                    }
                    
                    stappen = new Array(parseInt(w_h[0])+2);
                    for (var i = 0; i < parseInt(w_h[0])+2; i++) {
                      stappen[i] = new Array(parseInt(w_h[1])+2).fill(0);
                    } 
                    
                  }
                  if (property == "up"){
                    info_connect = value.split(",");
                    north_c = info_connect[0];
                    north_adj = info_connect[1];
                  }
                  if (property == "down"){
                    info_connect = value.split(",");
                    south_c = info_connect[0];
                    south_adj = info_connect[1];
                  }
                  if (property == "music"){
                    musicOfLocation = value;
                  }
                    
                  //als het een png is en load het op het veld
                  if (property.indexOf("png")>-1){ 
                    elemento = document.createElement("div");
                    elemento.style.width = '10vmax';
                    elemento.style.height = '10vmax';
                    pos = value.split(",");
                    pos_x = parseInt(pos[0]);
                    pos_y = parseInt(pos[1]);
                    elemento.id = 'x'+pos_x+'y'+pos_y;
                    elemento.style.backgroundImage = "url('tiles/"+property+"')";
                    elemento.style.backgroundSize = 'cover';
                    $("#location").append(elemento);
                    elemento.style.position = 'absolute';
                    elemento.style.left = String(pos_x*10 - 10)+'vmax';
                    elemento.style.top = String(pos_y*10 - 10)+'vmax';
                    if (property.indexOf("ground")>-1){ //{} dit overal zetten want 2 lijnen
                      $(elemento).addClass("ground");
                      kamer[pos_x][pos_y] = "ground";
                      stappen[pos_x][pos_y] = 1;
                    }
                    else if (property.indexOf("water")>-1){
                      $(elemento).addClass("water");
                      kamer[pos_x][pos_y] = "water";
                    }
                    else if (property.indexOf("grass")>-1){
                      $(elemento).addClass("grass");
                      kamer[pos_x][pos_y] = "grass";
                    }
                    else if (property.indexOf("door")>-1){
                      $(elemento).addClass("door");
                      kamer[pos_x][pos_y] = "door";
                    }
                    else if (property.indexOf("stairs")>-1){
                      $(elemento).addClass("stairs");
                      kamer[pos_x][pos_y] = "stairs";
                      stappen[pos_x][pos_y] = 1;
                    }
                    else if (property.indexOf("rug")>-1){
                      $(elemento).addClass("rug");
                      kamer[pos_x][pos_y] = "rug";
                      stappen[pos_x][pos_y] = 1;
                    }
                  }
                  else if (property.indexOf("sign")>-1 || property.indexOf("warp")>-1){
                    element_info = value.split(",");
                    id_element = element_info[0];
                    pos_x = element_info[1];
                    pos_y = element_info[2];
                    
                    warps[pos_x+"x"+pos_y] = element_info[3]+element_info[4]+element_info[5];
                    //bv: warp:1,8,pt_house1_f1,4,4
                    
                    
                    elemento = document.createElement("div");
                    elemento.style.width = '10vmax';
                    elemento.style.height = '10vmax';
                    $("#location").append(elemento);
                    elemento.style.position = 'absolute';
                    elemento.style.left = String(pos_x*10 - 10)+'vmax';
                    elemento.style.top = String(pos_y*10 - 10)+'vmax';
                    if (property.indexOf("sign")>-1){
                      $(elemento).addClass("sign");
                      $(elemento).prop("id", "sign-"+id_element);
                    }
                    if (property.indexOf("warp")>-1){
                      $(elemento).addClass("warp");
                      $(elemento).prop("id", "warp-"+id_element);
                      
                    }
                  }
                }
                
                console.log(kamer);
                printArray(kamer);
              
                $("#location").css("width",width+"vmax");
                $("#location").css("height",height+"vmax");
                border_s = 'tiles/'+border;
                $("#borderTop").css("background-image","url("+border_s+")");
                $("#borderLeft").css("background-image","url("+border_s+")");
                $("#borderRight").css("background-image","url("+border_s+")");
                $("#borderDown").css("background-image","url("+border_s+")");

            }
        }
    }
    
    
    rawFile.send(null);
    //start wordt meegegeven met deze functie
    if (start == true){
      //positie van player uit textfile halen
      loadDataOfPlayer();
      //staat in keyboard.js en is om de text te updaten 
      refreshPlayerPositionData();
      
    }
    if (musicOfLocation != music){
      music = musicOfLocation;
      playMusic();
    }
}



function positionPlayer(new_x,new_y){
  x = new_x;
  y = new_y;
  screen_height = parseInt($("#screen").css("height"));
  screen_width = parseInt($("#screen").css("width"));
  $("#location").css("left", -x*vmax(10));
  $("#location").css("top",  -y*vmax(10)-vmax(20));
  location_top = parseInt($("#location").css("top"));
  location_left = parseInt($("#location").css("left"));
  location_width = parseInt($("#location").css("width"));
  location_height = parseInt($("#location").css("height"));
  $("#player").css("top",-location_top-vmax(30));
  $("#player").css("left",-location_left-vmax(10));
  /*  er zijn geen borders meer
  $("#borderTop").css("top", -y*vmax(10));
  $("#borderTop").css("left", -x*vmax(10) + vmax(10));
  $("#borderTop").css("width",location_width + screen_width - vmax(10));
  $("#borderLeft").css("left", -x*vmax(10) + vmax(10));
  $("#borderLeft").css("top", -y*vmax(10));
  $("#borderLeft").css("height", location_height + screen_height/2 - vmax(5));
  $("#borderRight").css("left", location_width - vmax(10)*x + vmax(10));
  $("#borderRight").css("height", location_height + screen_height/2 - vmax(5));
  $("#borderRight").css("top", -y*vmax(10));
  $("#borderDown").css("left", vmax(50) - x*vmax(10));
  $("#borderDown").css("top", -y*vmax(10) - vmax(4));
  $("#borderDown").css("width",location_width + screen_width - vmax(10));*/
}

function checkIfLocationChanged(){

  [pl_x,pl_y] = obtainPlayerPosition();
  if (pl_y == 0 && north_c != "none"){ // has gone to the north connector
    emptyConnectors();
    loadLocation("locations/"+north_c, false);
    $("#location").css("top",-height + (screen_height/2)+vmax(5));
    $("#player").css("top",height-vmax(10) -vmax(2));
    $("#borderTop").css("top",-height);
    $("#borderRight").css("left",width-(pl_x*vmax(10))-vmax(10));
    $("#borderRight").css("height",height + screen_height/2 - vmax(5));
    $("#borderRight").css("top",-height);
    $("#borderDown").css("top",-height - screen_height/2 + vmax(5));
    $("#borderLeft").css("left",-width+(pl_x*vmax(10))-vmax(10));
    $("#borderLeft").css("top",-height);
    $("#borderLeft").css("height",height + screen_height/2 - vmax(5));
    loadConnectors();
  }
  if (pl_y > height/vmax(10)  && south_c != "none"){ // has gone to the south connector
    emptyConnectors();
    loadLocation("locations/"+south_c, false);
    $("#location").css("top",(screen_height/2)-vmax(5));
    $("#player").css("top",-vmax(2));
    $("#borderTop").css("top",-vmax(10));
    $("#borderRight").css("left",width - pl_x*vmax(10));
    $("#borderRight").css("height",height + screen_height/2 - vmax(10));
    $("#borderRight").css("top",-vmax(20));
    $("#borderDown").css("top",-height + 3*screen_height/2 - vmax(10));
    $("#borderLeft").css("left",-(pl_x-1)*vmax(10));
    $("#borderLeft").css("top",-vmax(10));
    $("#borderLeft").css("height",height + screen_height/2 - vmax(10));
    loadConnectors();
  }
}

function emptyLocation(){
  loc = document.getElementById("location");
  children = loc.children;
  for (var i = 0; i<children.length;i++){
    if (children[i].id!='player'){
      loc.removeChild(children[i]);
      i = i-1;
    }
  }
}

function emptyConnectors(){
  $("#up").empty();
  $("#up").css("width",0);
  $("#up").css("height",0);
  $("#down").empty();
  $("#down").css("width",0);
  $("#down").css("height",0);
}

//dit is om berichten die op een bord staan in een file te kunnen steken in plaats van alles te hardcoden, gebruiken dus!
function obtainMessage(id_sign){
    var txt_to_return='';
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", "events/scripts.txt", false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
              var lines = rawFile.responseText.split('\n');
              for(var line = 0; line < lines.length; line++){
                line_txt = lines[line];
                prop_val = line_txt.split(":");
                property = prop_val[0];
                value = prop_val[1];
                if (property == id_sign)
                  txt_to_return=value;
              }
            }
          }
      }
      rawFile.send(null);
      return txt_to_return;
  }


  function playMusic(){
    s_o_g = document.getElementById("soundOfGame");
    s_o_g.src = "sounds/"+music;
    //s_o_g.play();
  }
