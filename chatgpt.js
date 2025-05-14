// Elements
const runBtn = document.getElementById("runBtn");
runBtn.addEventListener("click", runaway);
const nxtRoomBtn = document.getElementById("nxtRoomBtn");
nxtRoomBtn.addEventListener("click", () => newRoom(deck));
const startNewGameBtn = document.getElementById("startNewGameBtn");
startNewGameBtn.addEventListener("click", () => startNewGame());
let cardContainer = document.getElementById("cardContainer");

// Run on page load
document.addEventListener('DOMContentLoaded', () => {
    startNewGame(); // Start a new game when the page loads
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

// Display the player's starting health
const hpTxt = document.getElementById("hpVal");
hpTxt.innerHTML = hp;

// Reset all variables
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

/**
 * Creates a deck of cards used in the game.
 * The deck includes:
 * - Diamonds and Hearts (red suits) with ranks 2 through 10.
 * - Spades and Clubs (black suits) with ranks 2 through 13.
 * Each card is represented as an object with a `suit` and `rank` property.
 * The resulting deck is stored in the global `deck` variable.
 */
function createDeck(){
    // Step 1: Define the suits and their colors
    let suits = {
        diamonds: "red",
        hearts: "red",
        spades: "black",
        clubs: "black"
    };
    // Step 2: Create arrays to hold the cards in
    let diamonds = [];
    let hearts = [];
    let spades = [];
    let clubs = [];

    // Step 3: Loop through each suit and assign cards based on their color
    for (let suit in suits) {
        let color = suits[suit];
      
        if (color === "red") {
            // Add cards with ranks 2 through 10 for red suits
            for (let i = 2; i < 11; i++) {
                if (suit === "diamonds") diamonds.push(i);
                if (suit === "hearts") hearts.push(i);
          }
        } else {
            // Add cards with ranks 2 through 13 for black suits
            for (let i = 2; i < 14; i++) {
                if (suit === "spades") spades.push(i);
                if (suit === "clubs") clubs.push(i);
          }
        }
    }
    // Step 4: Combine all cards from each suit into a single deck
    deck = [
        ...diamonds.map(card => ({ suit: 'diamonds', rank: card })),
        ...hearts.map(card => ({ suit: 'hearts', rank: card })),
        ...spades.map(card => ({ suit: 'spades', rank: card })),
        ...clubs.map(card => ({ suit: 'clubs', rank: card }))
    ];
}

// Shuffles the cards within the deck 
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

// Displays the cards from the given room array in the dynamicCards container.
function displayRoom(room) {
    // Get the container for displaying room cards
    const dynamicCards = document.getElementById("dynamicCards");
    
    // Clear the container to prepare for new cards
    dynamicCards.innerHTML = "";

    // Add each card in the room array as an image element
    for (let i = 0; i < room.length; i++) {
        const cardImg = document.createElement("img");
        cardImg.id = `card${i}`; // Assign an ID based on position in array
        cardImg.src = `./PNG-cards-1.3/${room[i].rank}_of_${room[i].suit}.png`; // Card image source 
        cardImg.alt = `${room[i].rank} of ${room[i].suit}`; // Set an alt for card image
        cardImg.style.height = "200px"; // Set image size
        dynamicCards.appendChild(cardImg); // Add the image to the container
    };
    // Checks if room array contains 1 card
    if (room.length < 2){
        // Enable the "next room" button if there is only 1 card left
        nxtRoomBtn.disabled = false;
    }else nxtRoomBtn.disabled = true;
}

// Sets up a new room with cards from the deck.
function newRoom(deck) {
    // Array to hold the cards removed from the deck
    let removedCards = [];

    // If there is 1 card remaining in the room, add 3 more cards
    if (room.length === 1) {
        removedCards = deck.splice(0, 3);  // Take the first 3 cards from the deck
        room.push(...removedCards); // Add the cards to the current room
    } else {
        // If the room is empty, replace it with 4 new cards 
        removedCards = deck.splice(0, 4); // Take the first 4 cards from the deck
        room = removedCards; // Replace the room with new cards
        prevRoom.push(...removedCards); // Keep track of previous room's cards 
    }

    // Render the updated room of cards to the screen
    displayRoom(room); 
}

// Reset variables and state for a new game
function startNewGame(){
    resetGameState();
    createDeck();
    shuffle(deck);
    newRoom(deck);
    hpTxt.innerHTML = hp;
    displayWeapon()
}
 
// Function that allows the player to run away from the current room.
function runaway() {
    // If button is NOT disabled, player CAN run
    if (!runBtn.disabled) {
        // Player chooses to run away, so disable the "run" button
        runBtn.disabled = true;

        // Set a variable to indicate the player cannot run away in the next room
        canRunNextRoom = false;

        // Return the cards from the previous room back into the deck
        deck.push(...prevRoom);

        // Generate a new room by drawing cards from the deck
        newRoom(deck);

        // Clear the previous room since the player has moved to a new one
        prevRoom = [];
    }
}

// Handles the logic for when a monster card is clicked.
function handleMonsterCard(card){
    // Store the rank of the monster card for calculations
    const monsterVal = card.rank

    // Case 1: Player has no weapon equipped
    if (!hasWeapon){
        // Calculate damage to player's HP based on the monster's strength
        dmgTaken(monsterVal) 
    } 

    // Case 2: Player has a weapon but has not yet slain any monsters
    if (!slainMonster){
        // Engage in combat using the current weapon
        handleWeaponAttack(card)
    }

    // Case 3: Player has slain monsters with the currently equipped weapon
    if (slainMonster) {
        // Check if the current monster is weaker than the previously slain monster
        if (card.rank < slainMonster.rank){
            // Run function for combat with weapon
            handleWeaponAttack(card);
        } else {
            // The monster is too strong for the current weapon
            alert(
                `The monster (${card.rank} strength) ignores your weapon! ` +
                `You fight it barehanded`
            );

            // Calculate damage to player's HP as the monster attacks
            dmgTaken(monsterVal);
        }
    }
    // Remove the monster card from the room and re-render the room
    room.splice(card.index, 1);
    displayRoom(room);
}

// Handles combat when the player attacks a monster with a weapon.
function handleWeaponAttack(card) {
    // Calculate the difference between the weapon's strength and the monster's strength
    const unblockedDamage = playerWep.rank - card.rank;
    // 5 - 7
    // - 2
    // If the weapon cannot fully block the monster's attack
    if (unblockedDamage < 0) {
        // Apply the remaining (unblocked) damage to the player's HP
        dmgTaken(unblockedDamage);
    }

    // Record the monster as slain, even if the weapon couldn't fully block the attack
    slainMonster = { suit: card.suit, rank: card.rank }; // Create an object to represent the slain monster
    slainMonsters.push(slainMonster); // Add the slain monster to the list of slain monsters

    // Update the display to reflect the updated list of slain monsters
    displaySlainMonsters(slainMonsters);
}

// Handles the logic for when a Hearts card is clicked.
function handleHeartsCard(card) {
    // Check if the player has not already used a Hearts card in this room
    if (!usedPot) {
        // If the HP increase would exceed 20, cap HP at 20
        if (hp + card.rank > 20) {
            hp = 20;
            hpTxt.innerHTML = hp; // Update the HP display
        } else {
            // Otherwise, increase HP by the card's rank
            hp += card.rank;
            hpTxt.innerHTML = hp; // Update the HP display
        }

        // Mark that a Hearts card has been used in this room
        usedPot = 1;

        // Remove the card from the room and update the display
        room.splice(card.index, 1);
        displayRoom(room);
    } else {
        // Alert the player that a Hearts card has already been used in this room
        alert("You cannot use another potion this room");
    }
}

// Handles the logic for when a Diamonds (weapon) card is clicked.
function handleDiamondsCard(card) {
    // Clear the list of previously slain monsters
    slainMonsters = [];
    slainMonster = false; // Reset to indicate no monsters have been slain with this weapon

    // Equip the player with the weapon represented by the Diamonds card
    let sword = card.rank; // Store the weapon's strength (optional)
    hasWeapon = true; // Set the player's weapon status to true
    playerWep = card; // Assign the Diamonds card as the player's weapon

    // Update the UI to display the new weapon
    displayWeapon(playerWep);

    // Remove the Diamonds card from the room and update the room display
    room.splice(card.index, 1);
    displayRoom(room);

    // Update the UI to reflect the cleared list of slain monsters
    displaySlainMonsters(slainMonsters);
}

// Add a click event listener to the card container
cardContainer.addEventListener("click", (event) => {
    // Check if the clicked element has an ID and is not the cardContainer itself
    if (event.target.id && event.target.id !== cardContainer.id) {
        // Extract the card ID (e.g., "card3") and convert it to the corresponding index
        const id = event.target.id; // e.g., "card3"
        const cardIndex = parseInt(id.replace("card", "")); // Extract "3" from "card3"

        // Retrieve the clicked card object from the room array
        const card = room[cardIndex];
        card["index"] = cardIndex; // Add the card's index as a property for future reference

        // Handle the card action based on its suit
        switch (card.suit) {
            case "clubs":
            case "spades":
                handleMonsterCard(card); // Handle monster cards (clubs and spades)
                break;
            case "hearts":
                handleHeartsCard(card); // Handle healing cards (hearts)
                break;
            case "diamonds":
                handleDiamondsCard(card); // Handle weapon cards (diamonds)
                break;
        }

        // Hide the run button after a card interaction
        runBtn.style.visibility = 'hidden';
    }
});

// Updates the weapon slot display based on the player's current weapon.
function displayWeapon(playerWep) {
    const weaponSlot = document.getElementById("weaponSlot"); // Get the weapon slot element
    weaponSlot.innerHTML = ""; // Clear any existing content in the weapon slot

    // Create image elements for the weapon and its damage card
    const weaponImg = document.createElement("img");
    const diamondCardImg = document.createElement("img");

    // Check if the player has a weapon equipped
    if (hasWeapon) {
        // Display the weapon image (sword)
        weaponImg.id = "weapon";
        weaponImg.src = "sword.png";
        weaponImg.alt = "sword";
        weaponImg.style.height = "200px";

        // Display the weapon's damage card (based on its rank and suit)
        diamondCardImg.src = `./PNG-cards-1.3/${playerWep.rank}_of_${playerWep.suit}.png`;
        diamondCardImg.style.height = "200px";

        // Append both the weapon image and diamond card image to the weapon slot
        weaponSlot.appendChild(weaponImg);
        weaponSlot.appendChild(diamondCardImg);
    } else {
        // Display bare fists if no weapon is equipped
        weaponImg.id = "weapon";
        weaponImg.src = "bareFist.png";
        weaponImg.alt = "bare fist";
        weaponImg.style.height = "75px";

        // Append the bare fist image to the weapon slot
        weaponSlot.appendChild(weaponImg);
    }
}

// Displays the monsters slain
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
        slainMonsterImg.style.height = "200px"; // Set image height
        slainMonsterImg.style.margin = "5px"; // Add some spacing between cards
        slainMonsterContainer.appendChild(slainMonsterImg);
    });
}   

// Updates the player's HP (health points) based on the damage caused by a monster.
function dmgTaken(monsterVal){
    // Check if the monster value is negative 
    // This indicates that the weapon failed 
    if (monsterVal < 0){
        hp += monsterVal;
    } else {
        hp -= monsterVal; 
    };
    hpTxt.innerHTML = hp;
    if(hp<=0){
        alert("Game Over");
    }
}