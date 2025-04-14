let hp = 20;
let hpTxt = document.getElementById("hpVal");
hpTxt.innerHTML = hp;
let rune;
let prevRune = [];
let canRunNextRune = true;
const runBtn = document.getElementById("runBtn");
runBtn.addEventListener("click", runaway);
const nxtRuneBtn = document.getElementById("nxtRuneBtn");
nxtRuneBtn.addEventListener("click", () => newRune(deck));
let sword;
let hasWeapon = false
let cardContainer = document.getElementById("cardContainer");
let myWep = []
let slainMonster;

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

function displayRune(rune) {
    console.log("rune length", rune.length);
    
    const dynamicCards = document.getElementById("dynamicCards");
    
    // Clear any previous cards
    dynamicCards.innerHTML = "";

    for (let i = 0; i < rune.length; i++) {
        const cardImg = document.createElement("img");
        cardImg.id = `card${i}`;
        cardImg.src = `./PNG-cards-1.3/${rune[i].rank}_of_${rune[i].suit}.png`;
        cardImg.alt = `${rune[i].rank} of ${rune[i].suit}`;
        cardImg.style.height = "200px";
        cardImg.classList.add("card"); // optional: add a class for styling
        dynamicCards.appendChild(cardImg);
    };
    if (rune.length < 2){
        nxtRuneBtn.disabled = false;
    }else nxtRuneBtn.disabled = true;
    return rune;
}
// new rune

function newRune(deck){
    console.log("newRune func running");
    console.log(deck.length);
    // player can run next rune
    if (canRunNextRune){
        // re-enable the button
        runBtn.disabled = false
    }
    // if player chose to run
    if (runBtn.disabled){
        // update variable so player can run next rune
        canRunNextRune = true;
    } 
    // grab first 4 cards
    let removedCards = deck.splice(0,4);
    rune = removedCards;
    // place these cards into an array
    prevRune.push(...removedCards);
    // return the first 4 cards
    displayRune(rune);
};

newRune(deck);

// run away mechanic
// can run away as long as you didn't run from previous rune
function runaway(){
    // if button is not disabled 
    if(!runBtn.disabled){
        console.log('start of run away function')
        // player chose to run away meaning they can not run away on next rune
        // disable button
        runBtn.disabled = true;
        canRunNextRune = false;
        // put the first 4 cards back into deck
        deck.push(...prevRune);
        // get a new rune
        console.log(prevRune);
        console.log("did it go back in deck? ", deck);
        // empty previous rune
        prevRune = []
        newRune(deck);
        console.log('the end of the run away function');
        
    }
    return runBtn;
}

cardContainer.addEventListener("click", (event) => {
    if (event.target.id && event.target.id !== cardContainer.id) {
        const id = event.target.id; // e.g. "card3"
        const cardIndex = parseInt(id.replace("card", "")); // 3
        for (i=0; i<rune.length; i++){
            if (cardIndex == i){
                const card = rune[i]
                if (card.suit === "clubs" || card.suit === "spades") {
                    // if no wep
                    // we will subtract from main hp
                    if (!hasWeapon){
                        hp -= card.rank;
                        hpTxt.innerHTML = hp;
                    } else {
                        // if you have a wep
                        // and if you've damaged your weapon (fought with it previously then)
                        // find out which value is bigger
                        // do subtraction
                        // take that value and take away from hp
                        if (!slainMonster){
                            myWep.rank -= card.rank;
                            if (myWep.rank < 0){
                                hp += myWep.rank
                                hpTxt.innerHTML = hp;
                                hasWeapon = false
                                
                            }
                            displayWeapon(myWep);
                            slainMonster = card.rank;
                        } else {
                            hp -= card.rank;
                            hpTxt.innerHTML = hp;
                        } 
                    }
                    // console.log("my hp", hp)
                    // console.log("my rune ", rune)
                };
                if (card.suit === "hearts"){
                    if (hp + card.rank > 20){
                        hp = 20
                        hpTxt.innerHTML = hp;
                        console.log("my hp is capped at", hp)
                    } else {hp += card.rank;
                        hpTxt.innerHTML = hp;
                    }
                };
                if (card.suit === "diamonds"){
                    sword = card.rank;
                    hasWeapon = true;
                    console.log("card",card)
                    myWep = card
                    displayWeapon(myWep)
                };
                    rune.splice(cardIndex, 1);
                    displayRune(rune);
            }
        }
    }
})
function displayWeapon(myWep){
    const weaponContainer = document.getElementById("weaponContainer");
    weaponContainer.innerHTML = "";
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
        weaponContainer.appendChild(weaponImg);
        weaponContainer.appendChild(weaponDmg);
        
    } else {
        weaponImg.id = "weapon";
        weaponImg.src = "bareFist.gif";
        weaponImg.alt = "bare fist";
        weaponImg.style.height = "200px";
        weaponContainer.appendChild(weaponImg);   
    }  
};
displayWeapon()