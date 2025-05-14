// Elements
const runBtn = document.getElementById("runBtn");
runBtn.addEventListener("click", runaway);
const nxtRoomBtn = document.getElementById("nxtRoomBtn");
nxtRoomBtn.addEventListener("click", () => newRoom(deck));
const resetGameBtn = document.getElementById("resetGameBtn");
resetGameBtn.addEventListener("click", () => newGame());
let cardContainer = document.getElementById("cardContainer");

// Run on page load
document.addEventListener('DOMContentLoaded', () => {
    newGame(); // Start a new game when the page loads
});
// Module-scoped variables
let hp = 20;
let deck = [];
let room = [];
let prevRoom = [];
let slainMonsters = [];
let hasWeapon = false;
let playerWep = [];
let usedPot = null;
let slainMonster = null;
let canRunNextRoom = true;
let cardIndex = null;
let isGameOver = false;

// let cardsLeft = deck.length;
// const cardsLeftTxt = document.getElementById("cardsLeft");
// cardsLeftTxt.innerHTML = cardsLeft;

const hpTxt = document.getElementById("hpVal");
hpTxt.innerHTML = hp;
// Function to reset all variables
function resetGameState() {
    hp = 20;
    deck = [];
    room = [];
    prevRoom = [];
    slainMonsters = [];
    hasWeapon = false;
    playerWep = [];
    usedPot = null;
    slainMonster = null;
    canRunNextRoom = true;
    cardIndex = null;
}
function createDeck(){
    let suits = {
        diamonds: "red",
        hearts: "red",
        spades: "black",
        clubs: "black"
    };
    let diamonds = [];
    let hearts = [];
    let spades = [];
    let clubs = [];

    for (let suit in suits) {
        let color = suits[suit];
      
        if (color === "red") {
          for (let i = 2; i < 11; i++) {
            if (suit === "diamonds") diamonds.push(i);
            if (suit === "hearts") hearts.push(i);
          }
        } else {
          for (let i = 2; i < 14; i++) {
            if (suit === "spades") spades.push(i);
            if (suit === "clubs") clubs.push(i);
          }
        }
    }
    deck = [
        ...diamonds.map(card => ({ suit: 'diamonds', rank: card })),
        ...hearts.map(card => ({ suit: 'hearts', rank: card })),
        ...spades.map(card => ({ suit: 'spades', rank: card })),
        ...clubs.map(card => ({ suit: 'clubs', rank: card }))
    ];
}
function shuffle(deck) {
    // Start at the last card in the deck
    let lastCard = deck.length - 1;

    // Continue shuffling until all cards are processed
    while (lastCard !== 0) {
        // Pick a random card from the remaining unshuffled cards
        let randomCard = Math.floor(Math.random() * lastCard);

        // Swap the last card with the randomly chosen card
        [deck[lastCard], deck[randomCard]] = [deck[randomCard], deck[lastCard]];

        // Move to the next card in the deck
        lastCard--;
    }   
}

function displayRoom(room) {
    const dynamicCards = document.getElementById("dynamicCards");
    
    // Clear any previous cards
    dynamicCards.innerHTML = "";

    for (let i = 0; i < room.length; i++) {
        const cardImg = document.createElement("img");
        cardImg.id = `card${i}`;
        cardImg.src = `./PNG-cards-1.3/${room[i].rank}_of_${room[i].suit}.png`;
        cardImg.alt = `${room[i].rank} of ${room[i].suit}`;
        cardImg.style.height = "200px";
        cardImg.classList.add("card"); // optional: add a class for styling
        dynamicCards.appendChild(cardImg);
    };
    if (room.length < 2){
        nxtRoomBtn.disabled = false;
    }else nxtRoomBtn.disabled = true;
    return room;
}

// new room
function newRoom(deck) {
    // Reset variables
    let removedCards = [];
    if (room.length === 1) {
        removedCards = deck.splice(0, 3);
        room.push(...removedCards);
    } else {
        removedCards = deck.splice(0, 4);
        room = removedCards;
        prevRoom.push(...removedCards);
    }
    displayRoom(room); // Render the cards
}
function newGame(){
    resetGameState();
    createDeck();
    shuffle(deck);
    newRoom(deck);
    hpTxt.innerHTML = hp;
    displayWeapon()
}
// run away mechanic
// can run away as long as you didn't run from previous room
function runaway(){
    // if button is not disabled 
    if(!runBtn.disabled){
        // player chose to run away meaning they can not run away on next room
        // disable button
        runBtn.disabled = true;
        canRunNextRoom = false;
        // put the first 4 cards back into deck
        deck.push(...prevRoom);
        // get a new room
        // empty previous room
        prevRoom = []
        newRoom(deck);        
    }
    return runBtn;
}
function handleMonsterCard(card){
    // if no wep
    // we will subtract from main hp
    const monsterVal = card.rank
    if (!hasWeapon){
        dmgTaken(monsterVal)
    } 
    // if player has not slain a monster
    if (!slainMonster){
        handleWeaponAttack(card)
    }
    // if player has slain w current weapon
    if (slainMonster) {
        // if monster has been slain with that sword
        // then check if current monster is smaller than previously slain monster
        if (card.rank < slainMonster.rank){
            alert("we can kill");
            handleWeaponAttack(card);
        } else {
            alert("Monster ignores weapon and attacks you head on", slainMonster)
            // have monster fully attack hp instead
            dmgTaken(monsterVal)
        } 
    }
        room.splice(card.index, 1);
        displayRoom(room);
}
function handleWeaponAttack(card) {
        const unblockedDamage = playerWep.rank - card.rank;
    
        // If weapon cannot block all damage
        if (unblockedDamage < 0) {
            // Subtract the remaining damage from the player's HP
            dmgTaken(unblockedDamage);
        }
        // monster should always be placed in slain even if not fully blocked
        slainMonster = { suit: card.suit, rank: card.rank }; // Record the slain monster
        slainMonsters.push(slainMonster);
        displaySlainMonsters(slainMonsters); // Update slain monster display 
}
function handleHeartsCard(card){
    if (!usedPot){
        if (hp + card.rank > 20){
            hp = 20
            hpTxt.innerHTML = hp;
        } else {hp += card.rank;
            hpTxt.innerHTML = hp;
        }
        usedPot = 1;
        room.splice(card.index, 1);
        displayRoom(room);
    } else {
        alert("already used POT this room");
    }
}
function handleDiamondsCard(card){
    slainMonsters=[];
    slainMonster = false
    let sword = card.rank;
    hasWeapon = true;
    playerWep = card
    displayWeapon(playerWep)
    room.splice(card.index, 1);
    displayRoom(room);
    displaySlainMonsters(slainMonsters); // Update slain monster display 
}
cardContainer.addEventListener("click", (event) => {
    if (event.target.id && event.target.id !== cardContainer.id) {
        const id = event.target.id; // e.g. "card3"
        const cardIndex = parseInt(id.replace("card", "")); // 3
        const card = room[cardIndex];
        card["index"] = cardIndex;
        switch (card.suit){
            case "clubs":
            case "spades":
                handleMonsterCard(card);
                break;
            case "hearts":
                handleHeartsCard(card);
                break;
            case "diamonds":
                handleDiamondsCard(card);
                break;
        }
        runBtn.style.visibility = 'hidden';
    }
})
function displayWeapon(playerWep){
    const weaponSlot = document.getElementById("weaponSlot");
    weaponSlot.innerHTML = "";
    const weaponImg = document.createElement("img");
    const weaponDmg = document.createElement("img");
    if (hasWeapon){
        weaponImg.id = "weapon";
        weaponImg.src = "sword.png";
        weaponImg.alt = "sword";
        weaponDmg.src = `./PNG-cards-1.3/${playerWep.rank}_of_${playerWep.suit}.png`
        weaponDmg.style.height = "200px";
        weaponImg.style.height = "200px";
        weaponSlot.appendChild(weaponImg);
        weaponSlot.appendChild(weaponDmg);
    } else {
        weaponImg.id = "weapon";
        weaponImg.src = "bareFist.gif";
        weaponImg.alt = "bare fist";
        weaponImg.style.height = "200px";
        weaponSlot.appendChild(weaponImg);   
    }  
};
// display slain monster 
function displaySlainMonsters(slainMonsters) {
    // Get the container element
    const slainMonsterContainer = document.getElementById("slainMonsterContainer");

    // Clear the container to avoid duplicates
    slainMonsterContainer.innerHTML = "";

    // Iterate through the `slainMonsters` array and create image elements
    slainMonsters.forEach(slainMonster => {
        const slainMonsterImg = document.createElement("img");
        slainMonsterImg.alt = "Previously slain monster card";
        slainMonsterImg.src = `./PNG-cards-1.3/${slainMonster.rank}_of_${slainMonster.suit}.png`;
        slainMonsterImg.style.height = "200px";
        slainMonsterImg.style.margin = "5px"; // Add some spacing between cards
        slainMonsterContainer.appendChild(slainMonsterImg);
    });
}   

function dmgTaken(monsterVal){
    if (monsterVal < 0){
        hp += monsterVal; // monsterVal is negative
        hpTxt.innerHTML = hp;
    } else {
        hp -= monsterVal; // monsterVal is negative
        hpTxt.innerHTML = hp;
    };
    if(hp<=0){
        alert("game over");
    }
}
