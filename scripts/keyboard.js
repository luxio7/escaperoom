var walkUp='right';
var walkDown='right';
var walking=false;
var speed=200;
var facing='down';
var goDown=false;

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
  return Math.min(vh(v), vw(v));
}

function vmax(v) {
  return Math.max(vh(v), vw(v));
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
  
    //1 naar boven en starten met wandelen
    //  walkUp is om de handen zo te laten bewegen 
    
      if (walking_up && walking==false){
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
          walkUp='right';
        }
      //laat ventje bewegen
        moveEverythingUp(vmax(10));
        actualTop = parseInt($("#player").css("top"));
        newTop = actualTop-vmax(10);
        $("#player").animate({
            'top':newTop
        },speed,function(){
            $("#player").css("background-image","url(sprites/up.png)");
            checkIfLocationChanged();
            refreshPlayerPositionData();
            checkIfInWarp();
            movePlayer();
        });
      } else {
        console.log("cant move because: " + kamer[pos_x][pos_y-1]);
      }
    }     
  
    //2 naar beneden wandelen
  
    else if (walking_down && walking==false){ //down
      $("#player").css("background-image","url(sprites/down.png)")
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
            checkIfLocationChanged();
            refreshPlayerPositionData();
            checkIfInWarp();
            movePlayer();
        });
      } else {
        console.log("cant move because: " + kamer[pos_x][pos_y+1]);
      }
  }
    //3 naar links wandelen
  
    else if (walking_left && walking==false){ //left
      $("#player").css("background-image","url(sprites/left.png)")
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
            checkIfLocationChanged();
            refreshPlayerPositionData();
            checkIfInWarp();
            movePlayer();
        });
      } else {
        console.log("cant move because: " + kamer[pos_x-1][pos_y]);
      }
  }
    //4 naar rechts wandelen
  
    else if (walking_right && walking==false){ //right
      $("#player").css("background-image","url(sprites/right.png)")
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
            checkIfLocationChanged();
            refreshPlayerPositionData();
            checkIfInWarp();
            movePlayer();
        });
      } else {
        console.log("cant move because: " + kamer[pos_x+1][pos_y]);
      }
    }
}

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
}

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
      checkIfLocationChanged();
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

function checkIfInWarp(){
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
      if (isInRug(pos_x,pos_y)==false){
        [new_x,new_y,nameOfMap] = obtainWhereToWarp(idWarp);
        fadeToBlackAndWarp(new_x,new_y,nameOfMap);
      }
      else{
        walking=false;
      }
    }
    else {
      walking=false;
    }
}

function fadeToBlackAndWarp(new_x,new_y,nameOfMap){
  $('#blackScreen').css("width",screen_width);
  $('#blackScreen').css("height",screen_height);
  $('#blackScreen').animate({
       opacity: 1,
     }, 300, function() {
         emptyConnectors();
         loadLocation("locations/"+nameOfMap,false);
         positionPlayer(new_x,new_y);
         loadConnectors();
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
    actualLeft = parseInt($("#borderTop").css("left"));
    newLeft = actualLeft+value;
    $("#borderTop").animate({
      'left':newLeft
    },speed);
    actualLeft = parseInt($("#borderLeft").css("left"));
    newLeft = actualLeft+value;
    $("#borderLeft").animate({
      'left':newLeft
    },speed);
    actualLeft = parseInt($("#borderRight").css("left"));
    newLeft = actualLeft+value;
    $("#borderRight").animate({
      'left':newLeft
    },speed);
    actualLeft = parseInt($("#borderDown").css("left"));
    newLeft = actualLeft+value;
    $("#borderDown").animate({
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
    actualTop = parseInt($("#borderTop").css("top"));
    newTop = actualTop+value;
    $("#borderTop").animate({
      'top':newTop
    },speed);
    actualTop = parseInt($("#borderLeft").css("top"));
    newTop = actualTop+value;
    $("#borderLeft").animate({
      'top':newTop
    },speed);
    actualTop = parseInt($("#borderRight").css("top"));
    newTop = actualTop+value;
    $("#borderRight").animate({
      'top':newTop
    },speed);
    actualTop = parseInt($("#borderDown").css("top"));
    newTop = actualTop+value;
    $("#borderDown").animate({
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

