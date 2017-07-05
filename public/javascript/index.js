let tiles;

/* Simple node class */
class node {
    constructor(node, string) {
        this.string = string;
        this.nexts = [];
        // this.previous = node; // For debugging use only
    }

    addNext(nextNode) {
        this.nexts.push(nextNode);
    }
}

const root = new node(null, "");

window.addEventListener('load', function () {
    document.querySelector('#submit-button').addEventListener('click', submit)
});

/* Resets the word bank and starts analysis on the input. */
function submit(event) {
    event.preventDefault();
    const wordBank = document.querySelector('#words');
    while(wordBank.hasChildNodes()) {
        wordBank.removeChild(wordBank.firstElementChild);
    }
    analyze();
}

/* Triggered by the submit button, this is the main path of the algorithm, which reads in the board, builds a
 quasi-trie network through it, and then compares a dictionary list with the network we have. */
function analyze() {
    // Read in the board.
    tiles = [
        document.querySelector('#i1').value.slice(0, 1),
        document.querySelector('#i2').value.slice(0, 1),
        document.querySelector('#i3').value.slice(0, 1),
        document.querySelector('#i4').value.slice(0, 1),
        document.querySelector('#i5').value.slice(0, 1),
        document.querySelector('#i6').value.slice(0, 1),
        document.querySelector('#i7').value.slice(0, 1),
        document.querySelector('#i8').value.slice(0, 1),
        document.querySelector('#i9').value.slice(0, 1),
        document.querySelector('#i10').value.slice(0, 1),
        document.querySelector('#i11').value.slice(0, 1),
        document.querySelector('#i12').value.slice(0, 1),
        document.querySelector('#i13').value.slice(0, 1),
        document.querySelector('#i14').value.slice(0, 1),
        document.querySelector('#i15').value.slice(0, 1),
        document.querySelector('#i16').value.slice(0, 1),
    ];
    //console.log(tiles); // board reading debug

    // recursively build a network of valid paths through the board
    for (let i = 0; i < tiles.length; i++) {
        recursiveSpread(i, tiles[i], [], root);
    }

    // Search for words via AJAX (AJAT?) one letter at a time.
    console.log(root);
    for (let i = 0; i < root.nexts.length; i++) {
        let data;
        const req = new XMLHttpRequest();
        let currentNode = root.nexts[i];
        req.open('GET', 'dictionary/' + currentNode.string.toUpperCase() + " Words.txt", true);
        req.addEventListener('load', function () {
            if(req.status >= 200 && req.status < 400) {
                data = req.responseText.split('\n');
                readDictionary(data);
            }
        });
        req.addEventListener('error', function(error) {
            console.log('there was an error parsing data', error);
        });
        req.send();
    }
}

/* Read one entry in the dictionary at a time. Start at the end of the word and work to the front. If we find the last
 letter of the word, send it off to try to find its way to the front. If it does, add it to the list. */
function readDictionary(data) {
    //console.log("reading dictionary", data); // debug ensure our dictionary is properly read.

    for (let i = 0; i < data.length; i++) {
        let currChar = data[i].charAt(data[i].length - 1);

        for (let j = 0; j < root.nexts.length; j++) {
            if (currChar === root.nexts[j].string) {
                //console.log(root.nexts[j]); // debug gather information on what root is being selected.
                if(findLastChar(data[i].slice(0, -1), root.nexts[j])) {
                    document.querySelector('#words').appendChild(document.createTextNode(data[i]));
                    document.querySelector('#words').appendChild(document.createElement("br"));
                }
            }
        }
    }
}

/* If we find one character that matches the last letter in a word, check its next nodes to see if it has another.
Repeat until we run out of letters (in which case the word IS on the board) or run out of nodes (in which case the word
 cannot be found on the board). */
function findLastChar(currString, currNode) {
    //console.log("lastChar currString", currString);
    if (currString.length === 0) {
        return true;
    }
    for (let i = 0; i < currNode.nexts.length; i++) {
        if (currString.charAt(currString.length - 1) === currNode.nexts[i].string) {
             return findLastChar(currString.slice(0, -1), currNode.nexts[i]);
        }
    }
    return false;
}

/* Spread outward with every tile to find all its valid paths through the board. */
function recursiveSpread(tile, string, usedTiles, currentNode) {
    // Points are only awarded for words up to 8 letters long, so we can stop counting there.
    usedTiles.push(tile);
    const newNode = new node(currentNode, tiles[tile]);
    //console.log("new node:", newNode, "from index", tile, usedTiles); // debug gather info on which nodes are made
    currentNode.addNext(newNode);

    const canGoUp = tile > 3 && !usedTiles.includes(tile - 4);
    const canGoDown = tile < 12 && !usedTiles.includes(tile + 4);
    const canGoLeft = (tile % 4) !== 0 && !usedTiles.includes(tile - 1);
    const canGoRight = (tile % 4) !== 3 && !usedTiles.includes(tile + 1);

    const canGoUpLeft = tile > 3 && (tile % 4) !== 0 && !usedTiles.includes(tile - 5);
    const canGoUpRight = tile > 3 && (tile % 4) !== 3 && !usedTiles.includes(tile - 3);
    const canGoDownLeft = tile < 12 && (tile % 4) !== 0 && !usedTiles.includes(tile + 3);
    const canGoDownRight = tile < 12 && (tile % 4) !== 3 && !usedTiles.includes(tile + 5);

    if (canGoUp) {
        recursiveSpread(tile - 4, string + "" + tiles[tile - 4], usedTiles.slice(0), newNode);
    }
    if (canGoUpLeft) {
        recursiveSpread(tile - 5, string + "" + tiles[tile - 5], usedTiles.slice(0), newNode);
    }
    if (canGoLeft) {
        recursiveSpread(tile - 1, string + "" + tiles[tile - 1], usedTiles.slice(0), newNode);
    }
    if (canGoDownLeft) {
        recursiveSpread(tile + 3, string + "" + tiles[tile + 3], usedTiles.slice(0), newNode);
    }
    if (canGoDown) {
        recursiveSpread(tile + 4, string + "" + tiles[tile + 4], usedTiles.slice(0), newNode);
    }
    if (canGoDownRight) {
        recursiveSpread(tile + 5, string + "" + tiles[tile + 5], usedTiles.slice(0), newNode);
    }
    if (canGoRight) {
        recursiveSpread(tile + 1, string + "" + tiles[tile + 1], usedTiles.slice(0), newNode);
    }
    if (canGoUpRight) {
        recursiveSpread(tile - 3, string + "" + tiles[tile - 3], usedTiles.slice(0), newNode);
    }

}