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

var websocket;

var warps = {};

var width_north=-1, height_north=-1;
var width_south=-1, height_south=-1;

var tellerPlaats = 1;
var plaatsWaarHijStaat = 'x1y2';

function openWebsocket(){
	websocket = new WebSocket('ws://192.168.4.1:8765');
	websocket.onopen = function(evt) { 
		console.log('verbinding gemaakt'); 
		setTimeout(websocket.send('gimme all the dataaa'),1000);
	};
	websocket.onclose = function(evt) { console.log('verbinding verbroken'); };
	websocket.onmessage = function(evt) { onMessage(evt) };
	websocket.onerror = function(evt) { console.log('error'); };
}

function onMessage(evt) {
	// There are two types of messages:
	// 1. position update -> update:playerID1=Xcoordinaat,Ycoordinaat;playerID2=Xcoordinaat,Ycoordinaat
	// 2. ...
	var message = evt.data;
	
	console.log('origineel bericht');
	console.log(message);
	console.log('--------');
	
	if (message.startsWith("update:")) {
		
		var messageStukken = message.slice(7, message.length);
		messageStukken = messageStukken.split(';');
		
		for (i = 0; i < messageStukken.length; i++){
			//positionOtherPlayer(playerID, x_new, y_new)
			var gesplitst = messageStukken[i].split('=');
			console.log(gesplitst);
			var coordinaten = gesplitst[1].split(',');
			positionOtherPlayer(parseInt(gesplitst[0]),coordinaten[0],coordinaten[1]);
			console.log('player ' + gesplitst[0] + ' werd geupdate naar: ' + coordinaten[0] + ',' + coordinaten[1]);
		}
		

	}else if (false) {
		console.log('nog maken');
	}else {
		console.log('Unknown command from server: ');
		console.log(message);
	}
}

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

//dit was een test om dingen te laten wandelen op een gemakkelijke manier maar het was te lelijk dus niet meer gebruiken
function loadOtherPlayers(){
	console.log(plaatsWaarHijStaat);
	var vorigePlaats = document.getElementById(plaatsWaarHijStaat);
	if (vorigePlaats.firstChild) {
		vorigePlaats.removeChild(vorigePlaats.firstChild);
	};
	var player2 = document.createElement('div');
	player2.className = 'players';
	player2.style.backgroundImage = "url('../sprites/right.png')";
	plaatsWaarHijStaat='x'+tellerPlaats.toString()+'y2';
	document.getElementById(plaatsWaarHijStaat).appendChild(player2);
	tellerPlaats = tellerPlaats + 1;
	if (tellerPlaats > 8){
		tellerPlaats = 1;
	};
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
                    if (property.indexOf("ground")>-1){
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
                      
                    	//bv: warp:1,8,r,pt_house1_f1,4,4 wordt 1x9:[pt_house1_f1,4,4]
											if (element_info[3] === "r") {
												warps[(parseInt(pos_x)+1)+"x"+pos_y] = [element_info[4],element_info[5],element_info[6]];
											} else if (element_info[3] === "l") {
												warps[(parseInt(pos_x)-1)+"x"+pos_y] = [element_info[4],element_info[5],element_info[6]];
											} else if (element_info[3] === "u") {
												warps[pos_x+"x"+(parseInt(pos_y)-1)] = [element_info[4],element_info[5],element_info[6]];
											} else if (element_info[3] === "d") {
												warps[pos_x+"x"+(parseInt(pos_y)+1)] = [element_info[4],element_info[5],element_info[6]];
											}
                    }
                  }
                }
                
								console.log("dit is de kamer");
                console.log(kamer);
							  console.log("dit zijn de warps");
								console.log(warps);
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
	makeNewPlayer(2,5,5);
	openWebsocket();
}

function getPositionFromCoordinates(x,y){
	return [vmax(x*10)-vmax(10),vmax(y*10)-vmax(20)];
}

var playerPositions = {};
function makeNewPlayer(playerID, x_pos, y_pos){
	playerPositions[playerID] = [x_pos,y_pos];
	var newPlayer = document.createElement('div');
	newPlayer.className = 'players';
	newPlayer.id='player'+playerID.toString();
	newPlayer.style.backgroundImage = "url('../sprites/down.png')";
	document.getElementById('location').appendChild(newPlayer);
	[x_pos,y_pos] = getPositionFromCoordinates(x_pos,y_pos);
	$("#player"+playerID.toString()).css("left",x_pos);
	$("#player"+playerID.toString()).css("top",y_pos);
}
function removePlayer(playerID){
	document.getElementById('player'+playerID.toString()).remove();
}
function positionOtherPlayer(playerID, x_new, y_new){
	[x_old,y_old] = playerPositions[playerID];
	[x_new,y_new] = getPositionFromCoordinates(x_new,y_new);
	$("#player"+playerID.toString()).css("left",x_new);
	$("#player"+playerID.toString()).css("top",y_new);
	
	if (x_old > x_new) {
		
		$("#player"+playerID.toString()).animate({
			'left':x_new
		},speed,function(){
			$("#player"+playerID.toString()).css("background-image","url(sprites/left.png)");
    });
		
	} else if (x_old < x_new){
		
		$("#player"+playerID.toString()).animate({
			'left':x_new
		},speed,function(){
			$("#player"+playerID.toString()).css("background-image","url(sprites/right.png)");
    });
		
	} 
		
	if (y_old > y_new) {
		
		$("#player"+playerID.toString()).animate({
			'top':y_new
		},speed,function(){
			$("#player"+playerID.toString()).css("background-image","url(sprites/up.png)");
    });
		
	} else if (y_old < y_new) {
		
		$("#player"+playerID.toString()).animate({
			'top':y_new
		},speed,function(){
			$("#player"+playerID.toString()).css("background-image","url(sprites/down.png)");
    });
		
	}
	playerPositions[playerID] = [x_new,y_new];
}

function positionPlayer(new_x,new_y){
  x = new_x;
  y = new_y;
  screen_height = parseInt($("#screen").css("height"));
  screen_width = parseInt($("#screen").css("width"));
  $("#location").css("left", -x*vmax(10));
  $("#location").css("top",  -y*vmax(10)-vmax(20));
	location_left = parseInt($("#location").css("left"));
  location_top = parseInt($("#location").css("top"));
	$("#player").css("left",-location_left-vmax(10));
  $("#player").css("top",-location_top-vmax(30));
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


var walkUp='right';
var walkDown='right';
var walking=false;
var speed=150; //200
var facing='down';
var goDown=false;
var canWarp = false;

var walking_down = false;
var walking_up = false;
var walking_left = false;
var walking_right = false;

function vh(v) {
  var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
  return (v * h) / 100;
}

function vw(v) {
  var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
  return (v * w) / 100;
}

function vmin(v) {
	if (v == 0) {
		return 0;
	} else {
		return Math.min(vh(v), vw(v));
	}
}

function vmax(v) {
	if (v == 0) {
		return 0;
	} else {
		return Math.max(vh(v), vw(v));
	}
}

function thereIsBarrier(pos_x, pos_y, where){
  var thereIs = false;
  $("#"+where).find(".barrier").each(function(index){
    barrier_l = parseInt($(this).css("left"))/10 + 1;
    barrier_t = parseInt($(this).css("top"))/10 + 1;
    if (barrier_l == pos_x && barrier_t == pos_y){
      thereIs = true;
    }

  });
  return thereIs;
}

function thereIsLedge(pos_x, pos_y, where){
  var thereIs = false;
  $("#"+where).find(".ledge").each(function(index){
    ledge_l = parseInt($(this).css("left"))/10 + 1;
    ledge_t = parseInt($(this).css("top"))/10 + 1;
    if (ledge_l == pos_x && ledge_t == pos_y){
      thereIs = true;
    }

  });
  return thereIs;
}

function movePlayer(){
    //waar je staat
    [pos_x,pos_y] = obtainPlayerPosition();
    canWarp = true;
  
    //1 naar boven en starten met wandelen
    //  walkUp is om de handen zo te laten bewegen 
    
      if (walking_up && walking==false){
				checkWarp(pos_x,pos_y-1);
        $("#player").css("background-image","url(sprites/up.png)")
        if (stappen[pos_x][pos_y-1]) {
        walking = true;
        facing = 'up';
        if (walkUp=='right'){
          $("#player").css("background-image","url(sprites/walkingUpRight.png)");
          walkUp='left';
        }
        else if (walkUp=='left'){
          $("#player").css("background-image","url(sprites/walkingUpLeft.png)");
          walkUp='right'
        }
      //laat ventje bewegen
        moveEverythingUp(vmax(10));
        actualTop = parseInt($("#player").css("top"));
        newTop = actualTop-vmax(10);
        $("#player").animate({
            'top':newTop
        },speed,function(){
            $("#player").css("background-image","url(sprites/up.png)");
            //checkIfLocationChanged();
            refreshPlayerPositionData();
            movePlayer();
        });
      } else {
        console.log("cant move because: " + kamer[pos_x][pos_y-1]);
      }
    }     
  
    //2 naar beneden wandelen
  
    else if (walking_down && walking==false){ //down
      $("#player").css("background-image","url(sprites/down.png)")
			checkWarp(pos_x,pos_y+1);
      if (stappen[pos_x][pos_y+1]){
        walking = true;
        facing = 'down';

        if (walkDown=='right'){
          $("#player").css("background-image","url(sprites/walkingDownRight.png)");
          walkDown='left';
        }
        else if (walkDown=='left'){
          $("#player").css("background-image","url(sprites/walkingDownLeft.png)");
          walkDown='right';
        }
        moveEverythingUp(-1*vmax(10));
        actualTop = parseInt($("#player").css("top"));
        newTop = actualTop+vmax(10);
        $("#player").animate({
            'top':newTop
        },speed,function(){
            $("#player").css("background-image","url(sprites/down.png)");
            //checkIfLocationChanged();
            refreshPlayerPositionData();
            movePlayer();
        });
      } else {
        console.log("cant move because: " + kamer[pos_x][pos_y+1]);
      }
  }
    //3 naar links wandelen
  
    else if (walking_left && walking==false){ //left
      $("#player").css("background-image","url(sprites/left.png)")
			checkWarp(pos_x-1,pos_y);
      if (stappen[pos_x-1][pos_y]) {
        walking=true;
        facing = 'left';
        if (parseInt($("#location").css("left")) == vmax(50)){
          $("#player").css("background-image","url(sprites/left.png)");
          walking_left=false;
          walking=false;
          return;
        }

        $("#player").css("background-image","url(sprites/walkingLeft.png)");
        moveEverythingLeft(vmax(10));
        actualLeft = parseInt($("#player").css("left"));
        newLeft = actualLeft-vmax(10);
        $("#player").animate({
            'left':newLeft
        },speed,function(){
            $("#player").css("background-image","url(sprites/left.png)");
            //checkIfLocationChanged();
            refreshPlayerPositionData();
            movePlayer();
        });
      } else {
        console.log("cant move because: " + kamer[pos_x-1][pos_y]);
      }
  }
    //4 naar rechts wandelen
  
    else if (walking_right && walking==false){ //right
      $("#player").css("background-image","url(sprites/right.png)")
			checkWarp(pos_x+1,pos_y);
      if (stappen[pos_x+1][pos_y]) {
        walking=true;
        facing='right';
        if (parseInt($("#location").css("left")) == -(parseInt($("#location").css("width")) - vmax(50))){
          $("#player").css("background-image","url(sprites/right.png)");
          walking_right=false;
          walking=false;
          return;
        }

        $("#player").css("background-image","url(sprites/walkingRight.png)");
        moveEverythingLeft(-1*vmax(10));
        actualLeft = parseInt($("#player").css("left"));
        newLeft = actualLeft+vmax(10);
        $("#player").animate({
            'left':newLeft
        },speed,function(){
            $("#player").css("background-image","url(sprites/right.png)");
            //checkIfLocationChanged();
            refreshPlayerPositionData();
            movePlayer();
        });
      } else {
        console.log("cant move because: " + kamer[pos_x+1][pos_y]);
      }
			
    }
    walking = false;
};

//gaat pas warpen bij een beweging 'uit de map' -> bv als je uit de deur wandelt, niet als je op de mat staat
function checkWarp(x,y) {
	console.log("check: " + x + " " + y);
  if ((canWarp) && ((x+"x"+y) in warps)){
		console.log("warp found");
		info = warps[x+"x"+y];
    fadeToBlackAndWarp(info[1],info[2],info[0]);
  }
};

function touchGo(dir){
    if (walking_down || walking_up || walking_left || walking_right || walking) // if already walking, ignore any input
      return;
    if (dir == 'left')
      walking_left = true;
    else if (dir == 'up')
      walking_up = true;
    else if (dir == 'right')
      walking_right = true;
    else if (dir == 'down')
      walking_down = true;
    movePlayer();
  
  if (false){   //TODO nog knop maken om dingen te lezen en dan is dat met dit ofzo
    if (walking)
      return;
    if (facing == 'up'){
      [pos_x, pos_y] = obtainPlayerPosition();
      id_sign = thereIsSign(pos_x,pos_y-1);
      if (id_sign>-1){
        message = obtainMessage(id_sign);
        alert(message);
      }
    }
    if (facing == 'down'){
      [pos_x, pos_y] = obtainPlayerPosition();
      id_sign = thereIsSign(pos_x,pos_y+1);
      if (id_sign>-1){
        message = obtainMessage(id_sign);
        alert(message);
      }
    }
    if (facing == 'left'){
      [pos_x, pos_y] = obtainPlayerPosition();
      id_sign = thereIsSign(pos_x-1,pos_y);
      if (id_sign>-1){
        message = obtainMessage(id_sign);
        alert(message);
      }
    }
    if (facing == 'right'){
      [pos_x, pos_y] = obtainPlayerPosition();
      id_sign = thereIsSign(pos_x+1,pos_y);
      if (id_sign>-1){
        message = obtainMessage(id_sign);
        alert(message);
      }
    }
  }
};

function touchStop(){
    walking_down=false;
    walking_up=false;
    walking_left=false;
    walking_right=false;
};

function isInRug(pos_x,pos_y){
  var found=false;
  $("#location").find(".rug").each(function(index){
    rug_l = parseInt($(this).css("left"))/vmax(10) + 1;
    rug_t = parseInt($(this).css("top"))/vmax(10) + 1;
    if (rug_l == pos_x && rug_t == pos_y){
      found=true;
    }
  });
  return found;
};

function jumpDown(){
  moveEverythingUp(-1*vmax(10));
  shadow = document.createElement("div");
  $(shadow).addClass("shadow");
  topOfShadow = parseInt($("#player").css("top"))+vmax(10);
  leftOfShadow = parseInt($("#player").css("left"));
  $(shadow).css("top",topOfShadow);
  $(shadow).css("left",leftOfShadow);
  document.getElementById("location").appendChild(shadow);
  actualTop = parseInt($("#player").css("top"));
  newTop = actualTop+vmax(5);
  $(shadow).animate({
    'top':topOfShadow+vmax(20)
  },speed*2);
  $("#player").animate({
      'top':newTop
  },speed,function(){
    moveEverythingUp(-1*vmax(10));
    actualTop = parseInt($("#player").css("top"));
    newTop = actualTop+vmax(15);
    $("#player").animate({
        'top':newTop
    },speed,function(){
        walking_down=false;
        walking=false;
        document.getElementById("location").removeChild(shadow);
        refreshPlayerPositionData();
      });
  });
}

function simulateWalkDown(){
  if (walkDown=='right'){
    $("#player").css("background-image","url(sprites/walkingDownRight.png)");
    walkDown='left';
  }
  else if (walkDown=='left'){
    $("#player").css("background-image","url(sprites/walkingDownLeft.png)");
    walkDown='right';
  }
  moveEverythingUp(-1*vmax(10));
  actualTop = parseInt($("#player").css("top"));
  newTop = actualTop+vmax(10);
  $("#player").animate({
      'top':newTop
  },speed,function(){
      $("#player").css("background-image","url(sprites/down.png)");
      //checkIfLocationChanged();
      refreshPlayerPositionData();
      walking=false;
  });
}

function checkIfInRugWarp(){
  [pos_x,pos_y] = obtainPlayerPosition();
  var idWarp = -1;
  $("#location").find(".warp").each(function(index){
    warp_l = parseInt($(this).css("left"))/vmax(10) + 1;
    warp_t = parseInt($(this).css("top"))/vmax(10) + 1;
    if (warp_l == pos_x && warp_t == pos_y){
      idWarp = $(this).prop("id").split("-")[1];
    }
  });
  if (idWarp>-1){
    if (isInRug(pos_x,pos_y)==true){
      walking=true;
      [new_x,new_y,nameOfMap] = obtainWhereToWarp(idWarp);
      goDown=true;
      fadeToBlackAndWarp(new_x,new_y,nameOfMap);
    }
  }
}

//TODO blackscreen bestaat niet meer in mijn code
function fadeToBlackAndWarp(new_x,new_y,nameOfMap){
	console.log("komt in fade to black and warp");
  $('#blackScreen').css("width",screen_width);
  $('#blackScreen').css("height",screen_height);
  $('#blackScreen').animate({
       opacity: 1,
     }, 300, function() {
         loadLocation("locations/"+nameOfMap,false);
         positionPlayer(new_x,new_y);
         refreshPlayerPositionData();
         $('#blackScreen').css("width",0);
         $('#blackScreen').css("height",0);
         $('#blackScreen').css("opacity",0);
         if (goDown){
            simulateWalkDown();
            goDown=false;
         }
         else{
           walking=false;
         }
     });
}

function thereIsSign(pos_x,pos_y){
  var id_sign = -1;
  $("#location").find(".sign").each(function(index){
    sign_l = parseInt($(this).css("left"))/vmax(10) + 1;
    sign_t = parseInt($(this).css("top"))/vmax(10) + 1;
    if (sign_l == pos_x && sign_t == pos_y){
        id_v = $(this).prop("id").split("-");
        id_sign = id_v[1];
    }

  });
  return id_sign;
}

function obtainPlayerPosition(){
  l= Math.round((parseInt($("#player").css("left")) + vmax(10))/vmax(10));
  t= Math.round((parseInt($("#player").css("top")) + vmax(10))/vmax(10));
  return [l,t]
}

function refreshPlayerPositionData(){
  [l,t] = obtainPlayerPosition();
  $("#positionOfPlayer").text(l+ ", " + t);
  $("#locationOfPlayer").text(location_name);
}

function moveEverythingLeft(value){
    actualLeft = parseInt($("#location").css("left"));
    newLeft = actualLeft+value;
    $("#location").animate({
      'left':newLeft
    },speed);
    actualLeft = parseInt($("#up").css("left"));
    newLeft = actualLeft+value;
    $("#up").animate({
      'left':newLeft
    },speed);
    actualLeft = parseInt($("#down").css("left"));
    newLeft = actualLeft+value;
    $("#down").animate({
      'left':newLeft
    },speed);
}

function moveEverythingUp(value){
    actualTop = parseInt($("#location").css("top"));
    newTop = actualTop+value;
    $("#location").animate({
      'top':newTop
    },speed);
    actualTop = parseInt($("#up").css("top"));
    newTop = actualTop+value;
    $("#up").animate({
      'top':newTop
    },speed);
    actualLeft = parseInt($("#down").css("top"));
    newLeft = actualLeft+value;
    $("#down").animate({
      'top':newLeft
    },speed);
}

