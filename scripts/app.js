/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 600;

let goodBlockRatio = 0.1;
let blockSpawnRate = 100;
let bombSpawnRate = 1000;
let medSpawnRate = 2000;
const BLOCK_SIZE = 32;

ctx.font = '30px serif';

ctx.textAlign = 'left';
ctx.fillText('left-aligned', 400, 300);

let player = {
	x: 0,
	y: canvas.height - BLOCK_SIZE * 3,
	width: BLOCK_SIZE * 2,
	height: BLOCK_SIZE / 2,

	isMovingLeft: false,
	isMovingRight: false,
	speed: 6,

	update: function () {
		// move left or move right if moving?
		if (this.isMovingLeft) this.x -= this.speed;
		if (this.isMovingRight) this.x += this.speed;
		if(this.isMovingLeft && this.x <= 0)this.x = 740;
		if(this.isMovingRight && this.x >= 740) this.x = 0;
	},
	render: function () {
		ctx.save();
		ctx.fillStyle = "black";
		ctx.fillRect(this.x, this.y, this.width, this.height);
		ctx.restore();
	},
};

let sbImage = new Image();
sbImage.src = "../Images/scoreboard.png"

let bombImage = new Image();
bombImage.src = "../Images/bomb.png"

let medImage = new Image();
medImage.src = "../Images/medkit.png"

let scoreBoard = {
	goodTally: 0,
	badTally: 0,
	goodBlocks: [],
	badBlocks: [],
	x: 8,
	y: 544,
	scoredBlockY: 552, 
	victoryBlockX: 384,
	isGameOver: false,
	didPlayerWin: false,
	scoreBlock: function (block) {
		let goodStartingX = 16;
		let badStartingX = 752;
		let scoreBlockSpacing = 40;
		if (block.isGoodBlock) {
			this.goodTally++;
			this.goodBlocks.push(block);
			spacingMultiplier = this.goodBlocks.length - 1;
			if(spacingMultiplier < 8){
				block.x = goodStartingX + (spacingMultiplier * scoreBlockSpacing);
			}
			else{
				block.x = this.victoryBlockX;
				this.isGameOver = true;
				this.didPlayerWin = true;
				ctx.font = '30px serif';
				ctx.textAlign = 'center';
				ctx.fillText('Game Over', 400, 300);
				ctx.font = '20px serif';
				ctx.fillText('You Win', 400, 325);
			}
		} else {
			this.badTally++;
			this.badBlocks.push(block);
			spacingMultiplier = this.badBlocks.length - 1;
			if(spacingMultiplier < 8){
				block.x = badStartingX - (spacingMultiplier * scoreBlockSpacing);
			}
			else{
				block.x = this.victoryBlockX;
				this.isGameOver = true;
				this.didPlayerWin = false;
				ctx.font = '30px serif';
				ctx.textAlign = 'center';
				ctx.fillText('Game Over', 400, 300);
				ctx.font = '20px serif';
				ctx.fillText('You Lose', 400, 325);
			}
		}
		block.isScored = true;
		block.y = this.scoredBlockY;
	},
	update: function(){
		
	},
	render: function(){
		ctx.save();
		ctx.drawImage(sbImage, this.x, this.y);
		this.goodBlocks.forEach(block => block.render());
		this.badBlocks.forEach(block => block.render());
		ctx.restore();
	}
};
window.addEventListener("keydown", (e) => {
	if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A")
		player.isMovingLeft = true;
	if (e.key === "ArrowRight" || e.key === "d" || e.key === "D")
		player.isMovingRight = true;
});

window.addEventListener("keyup", (e) => {
	if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A")
		player.isMovingLeft = false;
	if (e.key === "ArrowRight" || e.key === "d" || e.key === "D")
		player.isMovingRight = false;
});

class Block {
	constructor() {
		this.width = BLOCK_SIZE;
		this.height = this.width;
		this.x = Math.random() * (canvas.width - this.width);
		this.y = 0 - this.height; // off screen to start
		this.speed = Math.random() * 10 + 1;
		this.isGoodBlock = Math.random() <= goodBlockRatio;
		this.isOffscreen = false;
		this.isCaught = false;
		this.isScored = false;

		this.isFading = false;
		this.opacity = 1;
		this.color = this.isGoodBlock ? 120 : 0;
	}

	update() {
		this.y += this.speed;
		this.isOffscreen = this.y >= canvas.height;
		this.checkForCatch();
		if (this.isFading) this.opacity -= 0.1;
	}

	render() {
		ctx.save();
		ctx.strokeRect(this.x, this.y, this.width, this.height,);
		ctx.fillStyle = `hsla(${this.color}, 100%, 50%, ${this.opacity})`;
		ctx.fillRect(this.x, this.y, this.width, this.height);
		ctx.restore();
	}

	checkForCatch() {
		let bottom = this.y + this.height;

		// if I am above the catch block, return
		if (bottom < player.y) return;
		if (this.isFading || this.isOffscreen || this.isCaught) return;

		let rhs = this.x + this.width;
		if (rhs < player.x || this.x > player.x + player.width) {
			this.isFading = true;
			return;
		}

		scoreBoard.scoreBlock(this);
		this.isCaught = true;
	}
}

class Bomb {
	constructor() {
		this.width = 32.132;
		this.height = 48.298;
		this.x = Math.random() * (canvas.width - this.width);
		this.y = 0 - this.height; // off screen to start
		this.speed = 4;
		this.isOffscreen = false;
		this.isCaught = false;
		this.isFading = false;
		this.opacity = 1;
	}

	update() {
		this.y += this.speed;
		this.isOffscreen = this.y >= canvas.height;
		this.checkForCatch();
		if (this.isFading) this.opacity -= 0.1;
	}

	render() {
		ctx.save();
		ctx.drawImage(bombImage, this.x, this.y, this.width, this.height);
		ctx.restore();
	}

	checkForCatch() {
		let bottom = this.y + this.height;

		// if I am above the catch block, return
		if (bottom < player.y) return;
		if (this.isFading || this.isOffscreen || this.isCaught) return;
		let rhs = this.x + this.width;
		if (rhs < player.x || this.x > player.x + player.width) {
			this.isFading = true;
			return;
		}
		scoreBoard.isGameOver = true;
		ctx.font = '30px serif';
		ctx.textAlign = 'center';
		ctx.fillText('Game Over', 400, 300);
		ctx.font = '20px serif';
		ctx.fillText('You Lose', 400, 325);
	}
}

class Med {
	constructor() {
		this.width = 39.216;
		this.height = 33.803;
		this.x = Math.random() * (canvas.width - this.width);
		this.y = 0 - this.height; // off screen to start
		this.speed = 7;
		this.isOffscreen = false;
		this.isCaught = false;
		this.isFading = false;
		this.opacity = 1;
	}

	update() {
		this.y += this.speed;
		this.isOffscreen = this.y >= canvas.height;
		this.checkForCatch();
		if (this.isFading) this.opacity -= 0.1;
	}

	render() {
		ctx.save();
		ctx.drawImage(medImage, this.x, this.y, this.width, this.height);
		ctx.restore();
	}

	checkForCatch() {
		let bottom = this.y + this.height;

		// if I am above the catch block, return
		if (bottom < player.y) return;
		if (this.isFading || this.isOffscreen || this.isCaught) return;
		let rhs = this.x + this.width;
		if (rhs < player.x || this.x > player.x + player.width) {
			this.isFading = true;
			return;
		}
		scoreBoard.badTally--;
		this.isOffscreen = true;
	}
}

// let myBlock = new Block();
// console.log(myBlock);


let blocks = [new Block()];
let bombs = [new Bomb()];
let meds = [new Med()];
let currentTime = 0;
let timeSinceLastBlock = 0;
let timeSinceLastBomb = 0;
let timeSinceLastMed = 0 ;

function gameLoop(timestamp) {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	let changeInTime = timestamp - currentTime;
	currentTime = timestamp;

	timeSinceLastBlock += changeInTime;
	if (timeSinceLastBlock >= blockSpawnRate) {
		timeSinceLastBlock = 0;
		blocks.push(new Block());
	}

	timeSinceLastBomb += changeInTime;
	if (timeSinceLastBomb >= bombSpawnRate) {
		timeSinceLastBomb = 0;
		bombs.push(new Bomb());
	}

	timeSinceLastMed += changeInTime;
	if (timeSinceLastMed >= medSpawnRate) {
		timeSinceLastMed = 0;
		meds.push(new Med());
	}

	blocks.forEach((block) => {
		block.update();
		block.render();
	});

	bombs.forEach((bomb) => {
		bomb.update();
		bomb.render();
	});

	meds.forEach((med) => {
		med.update();
		med.render();
	});

	blocks = blocks.filter((b) => !b.isOffscreen && !b.isCaught);
	bombs = bombs.filter((q) => !q.isOffscreen && !q.isCaught);
	meds = meds.filter((m) => !m.isOffscreen && !m.isCaught);
	//console.log(blocks);

	player.update();
	player.render();

	scoreBoard.update();
	scoreBoard.render();
	console.log(scoreBoard.badTally);
	if(!scoreBoard.isGameOver){
	requestAnimationFrame(gameLoop);
	}
}

requestAnimationFrame(gameLoop);
