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
                    pos_x = pos[0];
                    pos_y = pos[1];
                    elemento.style.backgroundImage = "url('tiles/"+property+"')";
                    elemento.style.backgroundSize = 'cover';
                    $("#location").append(elemento);
                    elemento.style.position = 'absolute';
                    elemento.style.left = String(pos_x*10 - 10)+'vmax';
                    elemento.style.top = String(pos_y*10 - 10)+'vmax';
                    if (property.indexOf("ground")>-1)
                      $(elemento).addClass("ground");
                    else if (property.indexOf("water")>-1)
                      $(elemento).addClass("water");
                    else if (property.indexOf("grass")>-1)
                      $(elemento).addClass("grass");
                    else if (property.indexOf("door")>-1)
                      $(elemento).addClass("door");
                    else if (property.indexOf("stairs")>-1)
                      $(elemento).addClass("stairs");
                    else if (property.indexOf("rug")>-1)
                      $(elemento).addClass("rug");
                    else if (property.indexOf("ledge")>-1)
                      $(elemento).addClass("ledge");
                    else {
                      $(elemento).addClass("barrier");
                    }
                  }
                  else if (property.indexOf("sign")>-1 || property.indexOf("warp")>-1){
                    element_info = value.split(",");
                    id_element = element_info[0];
                    pos_x = element_info[1];
                    pos_y = element_info[2];
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
      loadConnectors();
    }
    if (musicOfLocation != music){
      music = musicOfLocation;
      playMusic();
    }
}

function loadConnectors(){
  emptyConnectors();
  if (north_c!="none"){
    loadConnector("locations/"+north_c,"#up",north_adj);
  }
  if (south_c!="none"){
    loadConnector("locations/"+south_c,"#down",south_adj);
  }
}

function loadConnector(name,where,adjustement){
  
  //de connector maps laden denk ik zodat je die ook kan zien als bij de route en de town, geen darkspots te zien daar

  var width_l, height_l;

  var rawFile = new XMLHttpRequest();
    rawFile.open("GET", name, false);
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
                  if (property == "border"){
                    border = value;
                  }
                  if (property == "size"){
                    size = value;
                    w_h = size.split("x");
                    width_l = parseInt(w_h[0]*vmax(10));
                    height_l = parseInt(w_h[1]*vmax(10));
                  }
                  if (property.indexOf("png")>-1){
                    elemento = document.createElement("div");
                    elemento.style.width = '10vmax';
                    elemento.style.height = '10vmax';
                    pos = value.split(",");
                    pos_x = pos[0];
                    pos_y = pos[1];
                    elemento.style.backgroundImage = "url('tiles/"+property+"')";
                    elemento.style.backgroundSize = 'cover';
                    $(where).append(elemento);
                    elemento.style.position = 'absolute';
                    elemento.style.left = pos_x*vmax(10) - vmax(10);
                    elemento.style.top = pos_y*vmax(10) - vmax(10);
                    if (property.indexOf("ground")>-1)
                      $(elemento).addClass("ground");
                    else if (property.indexOf("water")>-1)
                      $(elemento).addClass("water");
                    else if (property.indexOf("grass")>-1)
                      $(elemento).addClass("grass");
                    else {
                      $(elemento).addClass("barrier");
                    }
                  }
                }
                $(where).css("width",width_l);
                $(where).css("height",height_l);
                actualLeft = parseInt($("#location").css("left"));
                [pl_x,pl_y] = obtainPlayerPosition();
                if (pl_y*vmax(10) > height)
                  pl_y = 1;
                if (where == "#up"){
                  $(where).css("top",-height_l - height-screen_height -pl_y*vmax(10) +vmax(10));
                  $(where).css("left",actualLeft + adjustement*vmax(10));
                  width_north = width_l * vmax(10);
                  height_north = height_l *vmax(10);
                }
                if (where == "#down"){
                  $(where).css("top",-height_l +screen_height- (pl_y*vmax(10))+vmax(10));
                  $(where).css("left",actualLeft + adjustement*vmax(10));
                  width_south = width_l * vmax(10);
                  height_south = height_l *vmax(10);
                }
            }
        }
    }
    rawFile.send(null);
}

function positionPlayer(new_x,new_y){
  x = new_x;
  y = new_y;
  screen_height = parseInt($("#screen").css("height"));
  screen_width = parseInt($("#screen").css("width"));
  $("#location").css("left", x*vmax(10)-vmax(50));
  $("#location").css("top",  y*vmax(10)-vmax(50));
  location_top = parseInt($("#location").css("top"));
  location_left = parseInt($("#location").css("left"));
  location_width = parseInt($("#location").css("width"));
  location_height = parseInt($("#location").css("height"));
  $("#player").css("top",location_top);
  $("#player").css("left",location_left);
  $("#")
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

  function obtainWhereToWarp(id_warp){
      var warpToReturn=-1, namepOfMap = '', new_x=1, new_y=1;
      var rawFile = new XMLHttpRequest();
      rawFile.open("GET", "events/warps.txt", false);
      rawFile.onreadystatechange = function ()
      {
          if(rawFile.readyState === 4)
          {
              if(rawFile.status === 200 || rawFile.status == 0)
              {
                var lines = rawFile.responseText.split('\n');
                for(var line = 0; line < lines.length; line++){
                  line_txt = lines[line];
                  prop_val = line_txt.split(",");
                  property = prop_val[0];
                  value = prop_val[1];
                  value2 = prop_val[2];
                  if (property == id_warp){
                    nameOfMap=value;
                    warpToReturn=value2;
                  }
                }
              }
            }
        }
        rawFile.send(null);
        var rawFile = new XMLHttpRequest();
        rawFile.open("GET", "locations/"+nameOfMap, false);
        rawFile.onreadystatechange = function ()
        {
            if(rawFile.readyState === 4)
            {
                if(rawFile.status === 200 || rawFile.status == 0)
                {
                  var lines = rawFile.responseText.split('\n');
                  for(var line = 0; line < lines.length; line++){
                      prop_val = lines[line].split(":");
                      property = prop_val[0];
                      value = prop_val[1];
                      if (property=="warp"){
                          value_v = value.split(",");
                          idw = value_v[0];
                          xw = value_v[1];
                          yw = value_v[2];

                          if (idw == warpToReturn){
                            new_x = xw;
                            new_y = yw;
                          }
                      }
                  }
                }
            }
        }
        rawFile.send(null);
        return [new_x,new_y,nameOfMap];
    }


  function playMusic(){
    s_o_g = document.getElementById("soundOfGame");
    s_o_g.src = "sounds/"+music;
    s_o_g.play();
  }
