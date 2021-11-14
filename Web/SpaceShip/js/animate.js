var speed = 1;
var movingToRight = true;
var spaceShip;
var spaceShipWidth;
var spaceShipHeight;
var spaceWidth;
var spaceHeight;
var spaceShipFloatDestY;
var spaceShipFloatDistance;
var starObjWidth;
var starObjHeight;
var animationID;
var spaceAngle;
var destPos = null;
var moveDir = null;
var distance = 0;
var lastDate = null;

/*little game, spaceShip floats in space and is losing its energy. Catch star before it disappears to get energy.
Try to live as long as possible.*/
var gameInfo = {
	score: 0,
	scoreObj: null,
	spaceShipEnergy: 100,
	energyObj: null,//const
	energyLoss: 8,
	energyLossTime: 0,
	energyLossInterval: 5000,//ms
	starEnergy: 5,
	starObj: null,//const
	showingStar: false,
	starLeftTime: 0,
	starRemainInterval: 7000,//ms
	starCurPos: [],
	spaceShipPos: [],
}

function resetGameInfo() {
	lastDate = new Date();

	gameInfo.score = 0;
	gameInfo.spaceShipEnergy = 100;
	gameInfo.energyLossTime = gameInfo.energyLossInterval;
	gameInfo.showingStar = false;
	gameInfo.starLeftTime = gameInfo.starRemainInterval;
	gameInfo.starObj.style.display = "none";//inline is default

	gameInfo.scoreObj.innerHTML = gameInfo.score;
	gameInfo.energyObj.innerHTML = gameInfo.spaceShipEnergy;
}

function randomMove(){
	var left = window.getComputedStyle(spaceShip).getPropertyValue("left");//get pixel
	var leftPos = parseFloat(left);//to number
	if(movingToRight){
		leftPos += speed;
	}
	else{
		leftPos -= speed;
	}
	/*check range*/
	if(leftPos > (spaceWidth-spaceShipWidth)){
		leftPos = spaceWidth-spaceShipWidth;
		movingToRight = false;
		spaceAngle = 180;
	}
	else if(leftPos < 0){
		leftPos = 0;
		movingToRight = true;
		spaceAngle = 0;
	}

	var top = window.getComputedStyle(spaceShip).getPropertyValue("top");//get pixel
	var topPos = parseFloat(top);//to number
	/*calculate distance between spaceShip's pos and its floatDestPos*/
	var spaceShipFloatDisplace = spaceShipFloatDestY - topPos;
	if(spaceShipFloatDisplace == 0 || Math.abs(spaceShipFloatDisplace) >= spaceShipFloatDistance){
		//reach floatDestPos, then generate a new one randomly
		spaceShipFloatDestY = Math.random()*(spaceHeight - spaceShipHeight);
		spaceShipFloatDisplace = spaceShipFloatDestY - topPos;//recalculate
	}
	spaceShipFloatDistance = Math.abs(spaceShipFloatDisplace);

	topPos += Math.sign(spaceShipFloatDisplace) * speed;
	/*check range*/
	if(topPos > (spaceHeight - spaceShipHeight)){
		topPos = (spaceHeight - spaceShipHeight);
	}
	else if(topPos < 0){
		topPos = 0;
	}
	
	gameInfo.spaceShipPos[0] = leftPos;
	gameInfo.spaceShipPos[1] = topPos;

	spaceShip.style.left = `${leftPos}px`;
	spaceShip.style.top = `${topPos}px`;
	spaceShip.style.transform = `rotate(${spaceAngle}deg)`;
}

function moveToDest(){
	var left = window.getComputedStyle(spaceShip).getPropertyValue("left");//get pixel
	var leftPos = parseFloat(left);//to number
	leftPos += (speed*moveDir[0]);
	/*check range*/
	if(leftPos > (spaceWidth-spaceShipWidth)){
		leftPos = spaceWidth-spaceShipWidth;
	}
	else if(leftPos < 0){
		leftPos = 0;
	}

	var top = window.getComputedStyle(spaceShip).getPropertyValue("top");//get pixel
	var topPos = parseFloat(top);//to number
	topPos += (speed*moveDir[1]);
	/*check range*/
	if(topPos > (spaceHeight - spaceShipHeight)){
		topPos = (spaceHeight - spaceShipHeight);
	}
	else if(topPos < 0){
		topPos = 0;
	}

	gameInfo.spaceShipPos[0] = leftPos;
	gameInfo.spaceShipPos[1] = topPos;

	spaceShip.style.left = `${leftPos}px`;
	spaceShip.style.top = `${topPos}px`;

	//check is arrive end
	var lastDistance = distance;
	var centerPos = [leftPos+spaceShipWidth/2, topPos+spaceShipHeight/2];
	var offset = [destPos[0]-centerPos[0], destPos[1]-centerPos[1]];
	distance = Math.sqrt(offset[0]**2+offset[1]**2);
	if(distance >= lastDistance){
		//reach or over
		destPos = null;
		moveDir = null;
		distance = 0;
		spaceAngle = movingToRight?0:180;
	}
}

function updateAnimation(){
	if(destPos != null && moveDir != null && distance != 0){
		moveToDest();
	}
	else{
		randomMove();
	}
}

function update(){
	updateGameLogic();
	updateAnimation();
}

function onLoad(){
	var speedObj = document.getElementById("speed");
	speedObj.value = 1;
	spaceShip = document.getElementById("spaceShip");
	spaceShipWidth = spaceShip.offsetWidth;
	spaceShipHeight = spaceShip.offsetHeight;

	var spaceObj = document.getElementById('space');
	spaceWidth = spaceObj.offsetWidth;
	spaceHeight = document.documentElement.scrollHeight * 0.5;
	spaceObj.style.height = `${spaceHeight}px`;
	spaceAngle = 0;

	spaceShipFloatDestY = Math.random()*(spaceHeight - spaceShipHeight);
	spaceShipFloatDistance = Math.abs(spaceShipFloatDestY);

	gameInfo.scoreObj = document.getElementById("score");
	gameInfo.energyObj = document.getElementById("energy");
	gameInfo.starObj = document.getElementById("star");

	starObjWidth = gameInfo.starObj.offsetWidth;
	starObjHeight = gameInfo.starObj.offsetHeight;

	resetGameInfo();

	animationID = setInterval(update, 1);

	var energyStatement = document.getElementById("energy_statement");
	energyStatement.innerHTML = `Spaceship loses ${gameInfo.energyLoss} energies every ${gameInfo.energyLossInterval/1000} seconds.`
	var starStatement = document.getElementById("star_statement");
	starStatement.innerHTML = `Click black space to move spaceship to catch star before its energy runs out. Each star gives ${gameInfo.starEnergy} energies.`
}

function onSpeedChange(newSpeed){
	if(speed != newSpeed){
		speed = parseInt(newSpeed);//attention!!! If we don't parseInt, it will become a str!!!!
		//for example, leftPos += speed; if leftPos=0.1 and speed=5
		//-> it will become 0.15 (str concatenate!) rather than 0.1+5;
	}
}

function onClickSpace(event){
  	destPos = [event.clientX, event.clientY];
  	var left = window.getComputedStyle(spaceShip).getPropertyValue("left");//get pixel
	var leftPos = parseFloat(left);//to number
  	var top = window.getComputedStyle(spaceShip).getPropertyValue("top");//get pixel
	var topPos = parseFloat(top);//to number
	var centerPos = [leftPos+spaceShipWidth/2, topPos+spaceShipHeight/2];

	moveDir = [destPos[0]-centerPos[0], destPos[1]-centerPos[1]];
	distance = Math.sqrt(moveDir[0]**2+moveDir[1]**2);
	if(distance == 0){
		destPos = null;
		moveDir = null;
		distance = 0;
		return;
	}
	moveDir[0] /= distance;
	moveDir[1] /= distance;
	if(moveDir[0] == 0){
		spaceAngle = moveDir[1]>0?90:270;
	}
	else{
		spaceAngle = Math.atan2(moveDir[1], moveDir[0])*180/Math.PI;
	}
	spaceShip.style.transform = `rotate(${spaceAngle}deg)`;
	if(-90 <= spaceAngle && spaceAngle <= 90){
		movingToRight = true;
	}
	else{
		movingToRight = false;
	}
}

function randomShowStar(){
	gameInfo.showingStar = true;
	gameInfo.starLeftTime = gameInfo.starRemainInterval;

	/*try to generate a uncatched star*/
	var x, y;
	var cnt = 100;
	while(cnt > 0){
		x = Math.random()*(spaceWidth-starObjWidth-starObjWidth/2) + starObjWidth/2;
		y = Math.random()*(spaceHeight-starObjHeight-starObjHeight/2) + starObjHeight/2;
		if(!checkCatchStar([x, y], gameInfo.spaceShipPos)){
			break;
		}
	}
	gameInfo.starCurPos[0] = x;
	gameInfo.starCurPos[1] = y;

	gameInfo.starObj.style.display = "inline";
	gameInfo.starObj.style.left = `${gameInfo.starCurPos[0]}px`;
	gameInfo.starObj.style.top = `${gameInfo.starCurPos[1]}px`;
}

function removeStar(){
	gameInfo.showingStar = false;
	gameInfo.starObj.style.display = "none";
}

function checkCatchStar(starPos, spaceShipPos){
	var l1 = starPos[0];//star left pos
	var r1 = l1 + starObjWidth;//right pos
	var t1 = starPos[1];//top
	var b1 = t1 + starObjHeight;//bottom

	var l2 = spaceShipPos[0];
	var r2 = l2 + spaceShipWidth;//right pos
	var t2 = spaceShipPos[1];//top
	var b2 = t2 + spaceShipHeight;//bottom

	if(((l1 < l2 && l2 < r1 && r1 < r2) || 
		(l2 < l1 && l1 < r2 && r2 < r1) || 
		(l1 < l2 && r2 < r1) || 
		(l2 < l1 && r1 < r2)) && 
		((t1 < t2 && t2 < b1 && b1 < b2) || 
		(t2 < t1 && t1 < b2 && b2 < b1) || 
		(t1 < t2 && b2 < b1) || 
		(t2 < t1 && b1 < b2))){
		// alert('catch');
		return true;
	}
	return false;
}

function checkIsGameOver(passTime) {
	gameInfo.energyLossTime -= passTime;
	if(gameInfo.energyLossTime <= 0){
		gameInfo.spaceShipEnergy = Math.max(0, gameInfo.spaceShipEnergy-gameInfo.energyLoss);
		gameInfo.energyLossTime = gameInfo.energyLossInterval;
		gameInfo.energyObj.innerHTML = gameInfo.spaceShipEnergy;
	}
	if(gameInfo.spaceShipEnergy <= 0){
		/*game over*/
		alert("Game Over!");
		resetGameInfo();
		return true;
	}
	return false;
}

function updateGameLogic(){
	var currentDate = new Date();
	var passTime = (currentDate.getTime()-lastDate.getTime());
	lastDate = currentDate;

	/*spaceShip logic*/
	if(checkIsGameOver(passTime)){
		return;
	}
	else{
		if(gameInfo.showingStar && checkCatchStar(gameInfo.starCurPos, gameInfo.spaceShipPos)){
			gameInfo.score += gameInfo.starEnergy;
			gameInfo.spaceShipEnergy += gameInfo.starEnergy;
			gameInfo.scoreObj.innerHTML = gameInfo.score;
			gameInfo.energyObj.innerHTML = gameInfo.spaceShipEnergy;
			removeStar();
		}
	}

	/*star logic*/
	if(!gameInfo.showingStar){
		randomShowStar();
	}
	else{
		gameInfo.starLeftTime -= passTime;//map speed from [1, 10] to [1, 2]
		if(gameInfo.starLeftTime <= 0){
			removeStar();
		}
	}
}
