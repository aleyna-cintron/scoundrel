// Persistent State
let hp = 20;
const hpTxt = document.getElementById("hpVal");
hpTxt.innerHTML = hp;

let room;
let prevRoom = [];
let canRunNextRoom = true;

const runBtn = document.getElementById("runBtn");
runBtn.addEventListener("click", runaway);

const nxtRoomBtn = document.getElementById("nxtRoomBtn");
nxtRoomBtn.addEventListener("click", () => newRoom(deck));

let hasWeapon = false;
let cardContainer = document.getElementById("cardContainer");
let myWep = [];
let slainMonster;
let slainMonsters = [];
let usedPot;

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

let deck = [
    ...diamonds.map(card => ({ suit: 'diamonds', rank: card })),
    ...hearts.map(card => ({ suit: 'hearts', rank: card })),
    ...spades.map(card => ({ suit: 'spades', rank: card })),
    ...clubs.map(card => ({ suit: 'clubs', rank: card }))
  ];

function shuffle(deck){
    // lastCard 
    let lastCard = deck.length - 1;
    // run it through the entire deck
    while (lastCard !== 0){
        let randomCard = Math.floor(Math.random() * lastCard);
        [deck[lastCard], deck[randomCard]] = [deck[randomCard], deck[lastCard]];
        lastCard--;
    }
    return deck;
}

shuffle(deck);
let cardsLeft = deck.length;
const cardsLeftTxt = document.getElementById("cardsLeft");
cardsLeftTxt.innerHTML = cardsLeft;

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

function newRoom(deck){
    // player can run next room
    if (canRunNextRoom){
        // re-enable the button
        runBtn.disabled = false
    }
    // if player chose to run
    if (runBtn.disabled){
        // update variable so player can run next room
        canRunNextRoom = true;
    } 
    // reset hp
    usedPot = null;
    // grab first 4 cards
    let removedCards = deck.splice(0,4);
    room = removedCards;
    // place these cards into an array
    prevRoom.push(...removedCards);
    // return the first 4 cards
    displayRoom(room);
};

newRoom(deck);

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
        room.splice(card.index, 1);
        displayRoom(room);
        return;
    } 
    // if player has not slain a monster
    if (!slainMonster){
        handleWeaponAttack(card)
        room.splice(card.index, 1);
        displayRoom(room);
        return;
    }
    // if player has slain w current weapon
    if (slainMonster) {
        // if monster has been slain with that sword
        // then check if current monster is smaller than previously slain monster
        if (card.rank < slainMonster.rank){
            alert("we can kill");
            // run function to calc if hp needs to take damage,
            // also wanna update slainMonster
            handleWeaponAttack(card);
            room.splice(card.index, 1);
            displayRoom(room);
        } else {
            alert("Monster ignores weapon and attacks you head on", slainMonster)
            console.log("Monster ignores weapon and attacks you head on", slainMonster, "rip my card is : ", card.rank)

            // have monster fully attack hp instead
            dmgTaken(monsterVal)
            room.splice(card.index, 1);
            displayRoom(room);
        } 
    }
}
function handleWeaponAttack(card) {
        // Calculate the weapon's remaining durability after the attack
        const unblockedDamage = myWep.rank - card.rank;
    
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
    myWep = card
    displayWeapon(myWep)
    room.splice(card.index, 1);
    displayRoom(room);
    displaySlainMonsters(slainMonsters); // Update slain monster display 
}
let cardIndex;
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
        cardsLeft = deck.length;
        cardsLeftTxt.innerHTML = cardsLeft;
    }
})
function displayWeapon(myWep){
    const weaponSlot = document.getElementById("weaponSlot");
    console.log("this is my wep",myWep)
    weaponSlot.innerHTML = "";
    const weaponImg = document.createElement("img");
    const weaponDmg = document.createElement("img");
    if (hasWeapon){
        weaponImg.id = "weapon";
        weaponImg.src = "sword.png";
        weaponImg.alt = "sword";
        weaponDmg.src = `./PNG-cards-1.3/${myWep.rank}_of_${myWep.suit}.png`
        console.log("my weapon is ", myWep.rank)
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
displayWeapon()
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

    // Log for debugging
    console.log("All slain monsters displayed:", slainMonsters);
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
        // flashing red screen
        // run function to reset deck and refresh game
        shuffle(deck);
    }
}