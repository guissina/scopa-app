const baralho = {
    1:'1 copas',
    2:'2 copas',
    3:'3 copas',
    4:'4 copas',
    5:'5 copas',
    6:'6 copas',
    7:'7 copas',
    8:'chapeu pobre copas',
    9:'cavalo copas',
    10:'rei copas',
    11:'1 espadas',
    12:'2 espadas',
    13:'3 espadas',
    14:'4 espadas',
    15:'5 espadas',
    16:'6 espadas',
    17:'7 espadas',
    18:'chapeu pobre espadas',
    19:'cavalo espadas',
    20:'rei espadas',
    21:'1 ouros',
    22:'2 ouros',
    23:'3 ouros',
    24:'4 ouros',
    25:'5 ouros',
    26:'6 ouros',
    27:'7 ouros',
    28:'chapeu pobre ouros',
    29:'cavalo ouros',
    30:'rei ouros',
    31:'1 paus',
    32:'2 paus',
    33:'3 paus',
    34:'4 paus',
    35:'5 paus',
    36:'6 paus',
    37:'7 paus',
    38:'chapeu pobre paus',
    39:'cavalo paus',
    40:'rei paus',
    index_val: function(cardId) {
        const cardName = this[cardId];

        if (!cardName) return 0;

        if (cardName.startsWith('1 ')) return 11;
        if (cardName.startsWith('3 ')) return 10;
        if (cardName.startsWith('rei ')) return 4;
        if (cardName.startsWith('cavalo ')) return 3;
        if (cardName.startsWith('chapeu pobre ')) return 2;
        if (cardName.startsWith('2 ')) return 0.1;
        if (cardName.startsWith('4 ')) return 0.2;
        if (cardName.startsWith('5 ')) return 0.3;
        if (cardName.startsWith('6 ')) return 0.4;
        if (cardName.startsWith('7 ')) return 0.5;

        return 0;
    }
};



const inventario_p1 = {
    mao_p1: {

    }
};

const inventario_p2 = {
    mao_p2: {

    }
};

const mesa = [];


let maco = [];

for (let i = 1; i <= 40; i++) {
    maco.push(i); 
}

function shuffle(array) {
    // Loop backwards through the array
    for (let i = array.length - 1; i > 0; i--) {
        // Pick a random index from 0 to i
        const j = Math.floor(Math.random() * (i + 1));
        
        // Swap array[i] and array[j] using destructuring assignment
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array; // Return the shuffled array
}

// Now we shuffle our keys!
shuffle(maco);



function drawRandom() {
    var num = Math.floor(Math.random() * (40)) + 1;
    return num;
}

function drawCard() {
    if (maco.length === 0) {
        console.log("acabaram as cartas");
        return null;
    }

    const carta = maco.pop();
    const nomeCarta = baralho[carta];
    const valorCarta = baralho.index_val[carta];

    return carta;
}

function findCardNum(nomeProcurado) {
    // Search the object for the key that matches the value
    const idDaCarta = Object.keys(baralho).find(key => baralho[key] === nomeProcurado);
    return idDaCarta;
}

// for (let i = 1; i <= 10; i++) {
//     inventario_p1.mao_p1[i] = baralho[i];
    
// }

for (let i=1; i<=3; i++) {
    inventario_p1.mao_p1[i] = baralho[drawCard()];
    inventario_p2.mao_p2[i] = baralho[drawCard()];
}

console.log(maco);

console.log('mao jogador 1: ');
console.log(inventario_p1.mao_p1)
console.log('mao jogador 2: ');
console.log(inventario_p2.mao_p2)


console.log('carta de briscola virada: ' + baralho[maco.at(-1)])

console.log(baralho[findCardNum(inventario_p1.mao_p1[1])])