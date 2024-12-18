const { resolve } = require('path');
const readline = require('readline');

function createWeapon(name, damage, durability) {
    return { name, damage, durability };
}

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function takeDamage(warrior, weapon) {
    warrior.health -= weapon.damage;
}

const weapons = [
    createWeapon('Sword', getRandomNumber(20, 30), getRandomNumber(2, 4)),
    createWeapon('Axe', getRandomNumber(5, 45), getRandomNumber(2, 4)),
    createWeapon('Bow', getRandomNumber(10, 25), getRandomNumber(2, 4)),
    createWeapon('Staff', getRandomNumber(5, 25), getRandomNumber(2, 4)),
    createWeapon('Dagger', getRandomNumber(10, 25), getRandomNumber(2, 4)),
    createWeapon('Spear', getRandomNumber(10, 20), getRandomNumber(2, 4)),
    createWeapon('Crossbow', getRandomNumber(5, 40), getRandomNumber(2, 4)),
    createWeapon('Baton', getRandomNumber(10, 25), getRandomNumber(2, 4)),
];

const warrior1 = createWarrior('Hehe', 100);
const warrior2 = createWarrior('Haha', 100);

function promptWeapon(warrior) {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        })

        rl.question(`
            Pick a weapon for ${warrior.name}:
            1- Sword
            2- Axe
            3- Bow
            4- Staff
            5- Dagger
            6- Spear
            7- Crossbow
            8- Baton    
        `, (choice) => {
            console.log('------------------------');
            const selectedWeapon = createWeapon(
                weapons[choice - 1].name,
                getRandomNumber(10, 20),
                getRandomNumber(2, 3),
            );

            warrior.assignWeapon(selectedWeapon);
            rl.close();
            resolve(choice);
        });

        rl.on('close', () => {
            rl.removeAllListeners('line');
        });

    });
}

function promptChangeWeapon(warrior) {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        })
        
        rl.question(`
            ${warrior.name}, would you like to change your weapon?
            1- Yes
            2- No    
        `, (choice) => {
            if (choice === '1') {
                promptWeapon(warrior).then(resolve);
            } else {
                rl.close();
                resolve();
            }
        });
    
        rl.on('close', () => {
            rl.removeAllListeners('line');
        });
    });
}

function pickWarriorTurn() {
    return new Promise((resolve) => {
        const index = Math.random() < 0.5 ? 0 : 1;
        resolve(index);
    });
}

promptWeapon(warrior1)
    .then(() => promptWeapon(warrior2))
    .then(() => {
        console.log('Let the battle begin!');
    })
    .then(() => {
        duel(warrior1, warrior2).catch((error) => {
            console.log(error);
        });
    });

function duel(warrior1, warrior2) {
    console.log(`The duel begins between ${warrior1.name} and ${warrior2.name}`);

    const warriors = [warrior1, warrior2];

    function changeWeaponSequence() {
        return promptChangeWeapon(warrior1)
                .then(() => promptChangeWeapon(warrior2));
    }

    async function battleSequence() {
        const randomIndex = await pickWarriorTurn();
        const firstAttack = warriors[randomIndex];
        const secondAttack = warriors[1 - randomIndex];

        if (firstAttack.weapon.durability <= 0) {
            console.log(`!!! ${firstAttack.name}'s ${firstAttack.weapon.name} is broken !!!`);
            await promptWeapon(firstAttack);
            console.log(`${firstAttack.name} changed their weapon.`);
        }

        if (secondAttack.weapon.durability <= 0) {
            console.log(`!!! ${secondAttack.name}'s ${secondAttack.weapon.name} is broken !!!`);
            await promptWeapon(secondAttack);
            console.log(`${secondAttack.name} changed their weapon.`);
        }

        console.log(`${firstAttack.name} is going to attack first!`);
        firstAttack.attack(secondAttack);
        console.log(`${firstAttack.name} attacked ${secondAttack.name} with their ${firstAttack.weapon.name}. ${secondAttack.name} has ${secondAttack.health} health remaining.`);
        if (secondAttack.health <= 0) {
            console.log(`${firstAttack.name} WINS!`);
            return;
        }
        firstAttack.weapon.durability--;

        console.log(`It's ${secondAttack.name} turn to attack!`);
        secondAttack.attack(firstAttack);
        console.log(`${secondAttack.name} attacked ${firstAttack.name} with their ${secondAttack.weapon.name}. ${firstAttack.name} has ${firstAttack.health} health remaining.`);
        if (firstAttack.health <= 0) {
            console.log(`${secondAttack.name} WINS!`);
            return;
        }
        secondAttack.weapon.durability--;

        await changeWeaponSequence();
        return battleSequence();
    }

    return battleSequence();
}


// Example createWarrior Submission
function createWarrior(name, health, weapon = { name: 'none', damage: 0 }) {
    return {
        name,
        health,
        weapon,
        attack(target) {
            const damage = this.weapon.damage;
            takeDamage(target, this.weapon);
            console.log(`${this.name} attacks ${target.name} with ${this.weapon.name} for ${damage} damage.`);
        },
        changeWeapon(newWeapon) {
            let old = this.weapon;
            this.weapon = newWeapon;
            console.log(`${this.name} changed their weapon from ${old} to ${newWeapon}`);
        },
        assignWeapon(newWeapon) {
            this.weapon = newWeapon;
            console.log(`${this.name} has acquired ${newWeapon.name}.`);
        }
    };
}
