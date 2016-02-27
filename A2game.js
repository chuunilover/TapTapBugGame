//UI VARS
var canvas;
var context;
var backgroundImage = new Image();
var pauseImage = new Image();
var playImage = new Image();
var burgerImage = new Image();
var tablecolor = "#4c00d3";
var buttons;

var gameInterval;
var bugSpawnInterval = null;

var fps = 50;
var timeleft = 0;

//GAME VARS
var ingame = false;
var curscore;
var bugs = [];
var food = [];
var level = 1;
var highscore;
var l2highscore;
var paused = false;
var bug_spawn_delay = 0;

window.onload = function() {
	//set up resources
	canvas = document.getElementById("gameCanvas");
	context = canvas.getContext("2d");
	backgroundImage.src = "picnicblanket.jpg";
	pauseImage.src = "pause.jpg";
	playImage.src = "play.jpg";
	burgerImage.src = "burger.png";	
	init_start_menu();
	reset_html();
}

function removeMenu(){
	if (document.getElementById("level-one").checked){
		level = 1;
	}
	else if(document.getElementById("level-two").checked){
		level = 2;
	}
	else{
		alert("Please select a level.");
		return;
	}
	document.getElementById("menu").innerHTML = "";
	context.canvas.width = 400;
	context.canvas.height = 700;
	start_game();
}

function click_level_1() {
	document.getElementById("hiscore").innerHTML = "High score for this level: " + String(highscore) + "<br />";
}

function click_level_2() {
	document.getElementById("hiscore").innerHTML = "High score for this level: " + String(l2highscore) + "<br />";
}

function reset_html() {
	document.getElementById("menu").innerHTML = "<h2> Tap Tap Bug!</h2>" +
	"<div id=\"hiscore\"> </div>" +
	"<input type=\"radio\" name=\"level\" id=\"level-one\" value=\"one\" onclick=\"click_level_1()\">Level 1<br />" +
	"<input type=\"radio\" name=\"level\" id=\"level-two\" value=\"two\" onclick=\"click_level_2()\">Level 2<br />" +
	"<button onclick=\"removeMenu()\">CRUSH THEM BUGS</button>";
	context.canvas.width = 0;
	context.canvas.height = 0;
	bugs = [];
}

function init_start_menu() {
 	//set up buttons and mouse listener
	buttons = [{x:350, y:23, rad:20, shape:"circle", id:"level1"},
				{x:350, y:53, rad:20, shape:"circle", id:"level2"},
			{x:133, y:60, width:150, height:30, shape:"rect", id:"play"},
			{x:180, y:50, width:40, height:40, shape:"rect", id:"pause"}]
	canvas.addEventListener("mousedown", handleMouseDown, false);
	
	//set up score
	curscore = 0;
	highscore = localStorage.getItem("highscore");
	l2highscore = localStorage.getItem("l2highscore");
	if(highscore === null){
		highscore = 0;
	}
	else{
		highscore = parseInt(highscore);
	}
	if(l2highscore === null){
		l2highscore = 0;
	}
	else{
		l2highscore = parseInt(l2highscore);
	}
	
	//set up UI
	drawStartMenu();
	select_lvl1();
}

function draw_UI(){
	var curHighScore = highscore;
	if(level == 2){
		curHighScore = l2highscore;
	}
	context.fillStyle = 'black';
	context.fillRect(0, 0, 400, 100);
	context.drawImage(backgroundImage, 0, 100, 600, 600);
	context.fillStyle = 'white';
	context.font="14px Times New Roman";
	context.fillText("High score: " + curHighScore, 20, 20);
	context.fillText("Current score: " + curscore, 250, 20);
	context.fillText("Time remaining: " + Math.trunc(timeleft/fps) + " seconds", 20, 50);
	if (paused){
		drawPlay();
	}
	else{
		drawPause();
	}
	for(i = 0; i < food.length; i++){
		drawBurger(food[i].x, food[i].y);
	}
	for(i = 0; i < bugs.length; i++){
		makeBug(bugs[i].x - 7, bugs[i].y - 30, bugs[i].colour, (bugs[i].fadetimer) / (2*fps));
	}
}

/* DRAWING FUNCTIONS */
function drawStartMenu(){
	context.fillStyle = tablecolor;
	context.fillRect(0, 0, 400, 100);
	context.drawImage(backgroundImage, 0, 100, 600, 600);
	context.font="20px Times New Roman";
	context.fillStyle = "#000000";
	context.fillText("Pick your poison!", 130, 40);
	context.fillRect(125, 60, 150, 30);
	context.fillStyle = "#ff0000";
	context.fillText("Play!", 182, 82)
}

function draw_level1() {
	//Level 1 circle + text (green)
	draw_circle(350, 20, 10, 'green', '#ababab');
	context.strokeStyle = 'green';
	context.font="14px Times New Roman";
	context.fillText("Level 1", 285, 24);
	
	//Level 2 circle + text (grey)
	draw_circle(350, 50, 10, '#bababa', '#444444');
    context.strokeStyle = '#444444';
	context.fillText("Level 2", 285, 54);
}

function draw_circle(x, y, rad, incolor, outcolor) {
	context.beginPath();
    context.arc(x, y, rad, 0, 2 * Math.PI, false);
    context.fillStyle = incolor;
    context.fill();
    context.lineWidth = 1;
    context.strokeStyle = outcolor;
    context.stroke();
}

function draw_level2() {
	//Level 1 text grey)
	draw_circle(350, 20, 10, '#bababa', '#444444');
	context.strokeStyle = '#bababa';
	context.font="14px Times New Roman";
	context.fillText("Level 1", 285, 24);
	
	//Level 2 text (red)
	draw_circle(350, 50, 10, 'red', 'ababab');
    context.fillStyle = 'red';
	context.font="14px Times New Roman";
	context.fillText("Level 2", 285, 54);
}

function drawBurger(x, y) {
	context.drawImage(burgerImage, x, y, 40, 40);
}

function drawPause() {
	context.drawImage(pauseImage, 180, 50, 40, 40);
}

function drawPlay() {
	context.drawImage(playImage, 180, 50, 40, 40);
}

/* MOUSE EVENT HANDLERS */
function handleMouseDown(event) {
	var click_x = event.pageX;
	var click_y = event.pageY;
	for(i = 0; i < buttons.length; i++){
		if(isClicked(buttons[i], click_x, click_y)){
			onButtonClicked(buttons[i].id);
		}
	}
	for(i = 0; i < bugs.length; i++){
		if((paused == false) && bugIsClicked(bugs[i], click_x, click_y) && !bugs[i].clicked){
			bugs[i].clicked = true;
			curscore += bugs[i].score;
		}
	}
}

function pause_unpause(){
	if(paused){
		drawPause();
	}
	else{
		drawPlay();
	}
	paused = !paused;
}

function bugIsClicked(bug, mousex, mousey){
	var dx = mousex - bug.x;
	var dy = mousey - bug.y;
	if(Math.sqrt(dx * dx + dy * dy) < 30){
		return true;
	}
	return false;
}

function isClicked(button, mousex, mousey){
	var dx = mousex - button.x;
	var dy = mousey - button.y;
	if(button.shape == "circle"){
		if(Math.sqrt(dx * dx + dy * dy) < button.rad){
			return true;
		}
		return false;
	}
	else { //button is a rectangle
		if(button.x <= mousex && mousex <= button.x + button.width &&
			button.y <= mousey && mousey <= button.y + button.height){
			return true;
		}
		return false;
	}
}

function onButtonClicked(buttonID) {
	if(buttonID == "level1"){
		if(!ingame)
			select_lvl1();
	}
	else if (buttonID == "level2"){
		if(!ingame)
			select_lvl2();
	}
	else if (buttonID == "play"){
		if(!ingame)
			start_game();
	}
	else if (buttonID == "pause"){
		if(ingame)
			pause_unpause();
	}
}

/* START MENU UI FUNCTIONS */
function select_lvl1() {
	draw_level1();
	level = 1;
}


function select_lvl2() {
	draw_level2();
	level = 2;
}


/* GAME FUNCTIONS */
function start_game() {
	if(gameInterval != null){
		clearInterval(gameInterval);
	}
	curscore = 0;
	bugs = [];
	draw_UI();
	ingame = true;
	spawn_random_foods();
	timeleft = 60*fps;
	paused = false;
	gameInterval = setInterval(run_game, 1000/fps);
}


function run_game() {
	if (!paused){
		if(bug_spawn_delay-- <= 0){
			bug_spawn_delay = Math.floor(Math.random() * fps * 2 + fps);
			spawn_random_bug();
		}
		if (check_bug_touching_food()){
			if(food.length > 0){
				update_bug_direction();
			}
			else{
				end_game();
				return;
			}
		}
		check_bug_touching_bug();
		var bugs_to_delete = [];
		for(i = 0; i < bugs.length; i++) {
			if(bugs[i].clicked) {
				bugs[i].fadetimer--;
				if(bugs[i].fadetimer <= 0){
					bugs_to_delete.unshift(i);
				}
			}
			else if (bugs[i].collision == true) {
				bugs[i].x -= bugs[i].dx * bugs[i].speed / fps;
				bugs[i].y -= bugs[i].dy * bugs[i].speed / fps;
				bugs[i].collision = false;
			}
			else {
				bugs[i].x += bugs[i].dx * bugs[i].speed / fps;
				bugs[i].y += bugs[i].dy * bugs[i].speed / fps;
			}
		}
		for(i = 0; i < bugs_to_delete.length; i++) {
			bugs.splice(bugs_to_delete[i], 1);
		}
		timeleft--;
		draw_UI();
		if(timeleft == 0){
			end_game();
		}
	}
}

function end_game() {
	bug_spawn_delay = 0;
	if(level==1){
		if(curscore > highscore){
			highscore = curscore;
		}
		localStorage.setItem("highscore", highscore);
		if(food.length > 0){
			//alert("Beat level 1! Score: " + String(curscore) + " High score: " + String(highscore));
			level = 2;
			bugs = [];
			food = [];
			start_game();
			return;
		}
		else{
			if (confirm("Game over! Play level 1 again? Score: " + String(curscore) + " High score: " + String(l2highscore))){
				bugs = [];
				food = [];
				start_game();
				return;
			}
		}
	}
	else{
		if(curscore > l2highscore){
			l2highscore = curscore;
		}
		localStorage.setItem("l2highscore", l2highscore);
		if (confirm("Game over! Play level 2 again? Score: " + String(curscore) + " High score: " + String(l2highscore))){
			bugs = [];
			food = [];
			start_game();
			return;
		}
	}
	ingame = false;
	clearInterval(gameInterval);
	bugs = [];
	food = [];
	reset_html();
}

function calculate_nearest_food(bug){
	var distance = -1;
	for (i = 0; i < food.length; i++){
		var dx = food[i].x - bug.x;
		var dy = food[i].y - bug.y;
		var curdistance = Math.sqrt(dx*dx + dy*dy);
		if(curdistance < distance || distance == -1){
			distance = curdistance;
			bug.dx = dx / curdistance;
			bug.dy = dy / curdistance;
		}
	}
	return bug;
}

function check_bug_touching_bug(){
	for (i = 0; i < bugs.length; i++) {
		for (j = i+1; j < bugs.length; j++) {
			if (!bugs[i].clicked && !bugs[j].clicked && bug_collision(bugs[i], bugs[j])) {
				if(priority(bugs[i],bugs[j]) == 1){
					bugs[j].collision = true;
				}
				else {
					bugs[i].collision = true;
				}
		
			}
		}
	}
}

function check_bug_touching_food() {
	var foods_to_remove = [];
	for (i = 0; i < bugs.length; i++) {
		for (j = 0; j < food.length; j++) {
			if (collision_detection(bugs[i], food[j])) {
				if(!foods_to_remove.contains(j)){
					foods_to_remove.unshift(j);
				}
			}
		}
	}
	for (i = 0; i < foods_to_remove.length ; i++) {
		food.splice(foods_to_remove[i], 1);
	}
	if (foods_to_remove.length > 0) {
		return true;
	}
	return false;
}

function update_bug_direction() {
	var i;
	for(i = 0; i < bugs.length; i++) {
		calculate_nearest_food(bugs[i]);
	}
}

function collision_detection(bug, food) {
	var dx = food.x - bug.x;
	var dy = food.y - bug.y;
	var curdistance = Math.sqrt(dx*dx + dy*dy);
	return curdistance < 20;
}

function spawn_random_foods() {
	food = [new_food(),
	new_food(),
	new_food()];
}

function new_food() {
	return {x:Math.random() * 360 + 20, 
	y:Math.random() * 460 + 220 ,
	eaten: false};
}

function trunc_int(value) {
	return value | 0;
}

function spawn_random_bug() {
	
	bugs = bugs.concat(calculate_nearest_food(new_bug()));
}

function new_bug() {
	var bugType = type();
	var bugScore = score(bugType);
	var bugSpeed = speed(bugType);
	var bugColour = 0;
	
	if (bugType == 1) {
		bugColour = 'Orange';
	}
	if (bugType == 2) {
		bugColour = 'Red';
	}
	if (bugType == 3) {
		bugColour = 'Black';
	}
	
	var bug = {
		x: Math.random() * 380 + 10,
		y: 100,
		type: bugType,
		score: bugScore,
		speed: bugSpeed,
		colour: bugColour,
		clicked: false,
		collision: false,
		dx: 0,
		dy: 0,
		fadetimer: 2 * fps,
	};
	return bug;

}


function type() {
	var temp = Math.floor(Math.random() * 10 + 1);
	var type = 0;

	if (temp <= 4) {
		type = 1; //Orange
	}
	if (temp > 4 && temp <= 7) {
		type = 2; //Red
	}
	if (temp > 7) {
		type = 3; //Black
	}
	return type;

}	

function score(typea) {
	var score = 0;
	if (typea == 1) {
		score = 1;
	}
	if (typea == 2) {
		score = 3;
	}
	if (typea == 3) {
		score = 5;
	}
	return score;
}

function speed(typea) {
	var speed = 0;
	if (level == 1) {
		if (typea == 1) {
			speed = 60;
		}
		if (typea == 2) {
			speed = 75;
		}
		if (typea == 3) {
			speed = 150;
		}
	}
	if (level == 2) {
		if (typea == 1) {
			speed = 80;
		}
		if (typea == 2) {
			speed = 100;
		}
		if (typea == 3) {
			speed = 200;
		}
	}
	return speed;
}
		
Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i] == obj) {
            return true;
        }
    }
    return false;
}

// Painting one bug with x, y being left top corner
// Adapted from drawn bug example in http://www.cs.toronto.edu/~mashiyat/csc309/Lectures/class3.zip
function makeBug(x, y, colour, bug_alpha){
        
        color = colour;
        alpha = bug_alpha;
        
        context.globalAlpha = alpha;
        
        /*-- Whiskers, legs and arms--*/
        context.beginPath();
        context.moveTo(x,y);
        context.lineTo(x+5, y+15);
        context.lineTo(x+10, y);
        context.moveTo(x+5, y+20);
        context.lineTo(x+4, y+22);
        context.lineTo(x+6, y+22);
        context.lineTo(x+5, y+20);
        context.moveTo(x, y+20);
        context.lineTo(x+10, y+40);
        context.moveTo(x+10, y+20);
        context.lineTo(x, y+40);
        context.lineWidth = 2;
        context.strokeStyle = color;

        /*-- Triangles on the tips --*/
        context.moveTo(x,y);
        context.lineTo(x, y+3);
        context.lineTo(x+1.73, y+2.4);
        context.lineTo(x, y);
        context.moveTo(x+10, y);
        context.lineTo(x+8.27, y+2.4);
        context.lineTo(x+10, y+3);
        context.lineTo(x+10, y);
        context.moveTo(x, y+20);
        context.lineTo(x, y+22);
        context.lineTo(x+1.6, y+21.25);
        context.lineTo(x, y+22);
        context.moveTo(x+10, y+20);
        context.lineTo(x+8.4, y+21.25);
        context.lineTo(x+10, y+22);
        context.lineTo(x+10, y+20);
        context.moveTo(x, y+40);
        context.lineTo(x, y+38);
        context.lineTo(x+1.6, y+38.25);
        context.lineTo(x, y+38);
        context.moveTo(x+10, y+40);
        context.lineTo(x+8.4, y+38.25);
        context.lineTo(x+10, y+38);
        context.lineTo(x+10, y+40);
        context.stroke();

        /*-- Body parts --*/
        context.beginPath();
        context.arc(x+5, y+15, 5, 0, 2*Math.PI);
        context.moveTo(x+5, y+21);
        context.bezierCurveTo(x, y+20, x, y+30, x+5, y+38.75);
        context.moveTo(x+5, y+21);	
        context.bezierCurveTo(x+10, y+20, x+10, y+30, x+5, y+38.75);
        context.fillStyle = color;
        context.lineWidth = 1;
        context.strokeStyle = "#000000";
        context.stroke();
        context.fill();

        /*-- Eyes and Mouth --*/
        context.beginPath();
        context.arc(x+3.3, y+13.2, 1, 0, 2*Math.PI);
        context.arc(x+6.75, y+13.2, 1, 0, 2*Math.PI);
        if (colour == "Black"){
		context.fillStyle = "#ffffff";
		context.strokeStyle = "#ffffff";
	}
	else{
		context.fillStyle = "#000000";
	}
        context.fill();
        context.beginPath();
        context.arc(x+5, y+15, 2.5, 0, Math.PI, false);
        context.stroke();
	context.globalAlpha = 1;
}

function priority(bug1, bug2) {
	if (bug1.type > bug2.type) {
		return 1;
	}
	else if (bug2.type > bug1.type) {
		return -1;
	}
	else{
		if (bug1.x > bug2.x) {
			return 1;
		}
		else
		{
			return -1;
		}
	}
}

	
function bug_collision(bug1, bug2) {
	var dx = bug1.x - bug2.x;
	var dy = bug1.y - bug2.y;
	var curdistance = Math.sqrt(dx*dx + dy*dy);
	return curdistance < 50;
}
	
