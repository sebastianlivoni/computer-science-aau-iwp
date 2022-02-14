/* ***************************************************************************************************************
* This program is inspired by Kurt Nørmarks exam assignment for C-programming for first semester students.
* This version of Yatzy is intentionally programmed as a simple C-style implementation in JavaScript; 
* Hence, more elegant JS implementations can be programmed. For IWP, this imperative style version is perfectly OK! 
**************************************************************************************************************** */
import fs from 'fs';  //enable use of file system
//Note that we use EC6 modules! 
//You may need to add this to the package.json file when using EC6 modules: "type": "module",

/* ***************************************************************************************************************
* First a series of basic constants and functions that are essential to yatzy games
**************************************************************************************************************** */

const M=10; //Number of dice to be used in the game:  >=5 , <=20
const minDice=1; const maxDice=6; //min and max value of a normal dice.

//A Yatzy "play" consists of completing 15 game rounds, plus computing 3 "special" status rounds (sum,bonus,total).
//Here simplified to 18 rounds.
const noRounds=18;
const rounds={ //as C-enums doesn't directly exist in JS, we emulate it using an object
  ones:   0,
  twos:   1,
  threes: 2,
  fours:  3,
  fives:  4,
  sixes:  5,
  sum:    6,
  bonus:  7,
  onePair:  8,
  twoPairs:  9,
  threeId:  10,
  fourId:   11,
  littleS:  12,
  bigS:     13,
  house:    14,
  chance:   15,
  yatzy:    16,
  total:    17
};

function isSpecialRound(round){ 
  return ((round===rounds.sum || round===rounds.bonus || round===rounds.total));
}

//An Array that contains the textual name of each round; used when printing the scoreboard.  
const roundsText=["1s", "2s",  "3s", "4s", "5s", "6s", "Sum", "Bonus", "1 Pair", "2 Pairs", "Three Identical", "Four Identical",
  "Little Straight",  "Big Straight",   "House",   "Chance",   "Yatzy",  "Total Score"
];

//return a random number between min and max
function random(min,max){
  return Math.floor(Math.random() * (max + 1 - min)) + min; 
}
//Function diceRoll returns an array that represents the outcome of rolling M dice
//e.g diceRoll [1,6,5,5,2] 
function roll(M){
    let diceRoll=[];
    for(let i=0;i<M;i++){
       diceRoll[i]= random(minDice,maxDice); 
    }
    return diceRoll;
}

//Function countDice computes an array that counts the number of occurrences of the dice in a given diceRoll.
//if diceRoll is [1,6,5,5,2] it returns diceCount [0,1,1,0,0,2,1] 
//ie the number of 1s is stored in index 1; 2s in index 2m etc;
//(remark that index 0 is not used. This is OK as we only store few arrays, and it simplifies the scoring functions as we do not need to adjust array index by 1)
//Also arrays in JavaScript are dynamic; see next lecture ;-)
function countDice(diceRoll){
    let diceCount=[];             //declare empty array
    for(let i=0;i<maxDice+1;i++){ //initialize with 0 counts
      diceCount[i]=0;
    }
    for(let i=0;i<diceRoll.length;i++){ //foreach dice, increment the corresponding count entry
        diceCount[diceRoll[i]]++;
    }
  return diceCount;
}

/* ***************************************************************************************************************
* Definition of the Yatzy Scoreboard
* The scoreboard is an array with an entry per round. Each entry is a "structs" (object) with 
* the round id, round name, score, and the original dice roll array, e.g 
* [{roundID:0, roundName:"1s",score:4,diceRoll:[1,1,5,2,1,6,1]},...] 
**************************************************************************************************************** */


//Function to record the result of playing a round into the scoreboard stored in "scoreBoard" 
function noteScore(scoreBoard,round,score,roll){
  scoreBoard[round]= {score: score, diceRoll:roll};
}

//Function to construct and initialize a scoreboard: returns a scoreBoard array  
function newScoreBoard(){
  let scoreBoard=[];
  for(let roundNo=0;roundNo<noRounds;roundNo++){ 
    noteScore(scoreBoard, roundNo, 0,[]); 
  }
  return scoreBoard;
}

//two functions to print the score board to console
//padString creates a string of ' ' characters of length 'length' 
function paddString(length){
  let padding ="";
  for (;length>0;length--) 
    padding+=" ";
  return padding
  //alternative implementation: return " ".repeat(length);
}

//pretty print the scoreboard to a string; then print to console
//1s               5413436214      2
//2s               5464334236      2
//3s               3541661516      3
//etc...
function printScores(scoreBoard){
  for(let round=0;round<scoreBoard.length;round++) {
    let roundName=roundsText[round];
    let score=String(scoreBoard[round].score);

    let dices=""; 
    for(let i=0;i<scoreBoard[round].diceRoll.length;i++) 
      dices+= scoreBoard[round].diceRoll[i];
    if(dices.length===0) 
      dices+=paddString(M);
    
    let output=roundName;
    output+=paddString(15-roundName.length) + "  " + dices +"  " + paddString(5-score.length)+score;
    console.log(output);
  }
}

/* ***************************************************************************************************************
*  A large collection of helper function to compute scores 
**************************************************************************************************************** */

//Function calcSum computes the sum of the first 6 rounds (1nes to 6es)
//assumes that these values are stored in the given scoreBoard parameter
function calcSum(scoreBoard){
  let sum=0;
  for(let round=rounds.ones; round<=rounds.sixes;round++)
    sum+=scoreBoard[round].score;
  return sum;
}

//Function calcBonus computes if the sum warrants a "bonus"
//with normal 5 dice Yatzy this sum must exceed 63; you may define your own rules!
function calcBonus(sum){
  if(sum>=63) 
      return 50;
    else 
      return 0;
}
//the scores of single dice. Eg. twos: 2*diceCount[2];
function calcSingle(dice,diceCount){ 
  return dice*diceCount[dice];
}
//function calcIdentical computes the score of N identical dice
//start backwards to find the largest identical N dice
function calcIdentical(diceCount,N){
  for(let dice=maxDice;dice>=minDice;dice--)
  if(diceCount[dice]>=N) 
     return dice*N;
 return 0;
}

//Function to the score of "a pair"
function calcPair(diceCount){
  return calcIdentical(diceCount,2)
}


//computes the score for "two pairs" game
//we need to find the two largest pairs, not being the same dice value
//dicesRoll [2,2,5,5,6,6,6,6]
//diceCount [0,0,2,0,0,2,4] should give 6+6+5+5
function calcTwoPairs(diceCount){
  let best1 = 0, best2 = 0

  for (let i = diceCount.length - 1; i >= 0; i--) {
    if (diceCount[i] >= 2) {
      if (i > best1) {
        best1 = i
      } else if (i > best2) {
        best2 = i
      }
    }
  }

  return best1 * 2 + best2 * 2
}

//Computes the score of a straight Little straight: dice values 1-5; big straight 2-6
function calcStraight(diceCount,start,stop) {
  let sum = 0;
  for (let i = start; i <= stop; i++) {
    if (diceCount[i] == 0) return 0 // nope it's not a straight
    sum += i
  }
  return sum
}
function calcHouse(diceCount) {
  let best3 = 0, best2 = 0
  for (let i = 0; i <= diceCount.length; i++) {
    if (diceCount[i] >= 3) {
      best3 = i
    } else if (diceCount[i] >= 2) {
      best2 = i
    }
  }
  if (best3 && best2) return best3 * 3 + best2 * 2
  else return 0
}
function calcChance(diceCount){
  return diceCount.reduce((prev = 0, curr, i) => prev + curr * i)
}
function calcYatzy(diceCount){
  for (let i = diceCount.length - 1; i > 0; i--) {
    if (diceCount[i] === 8) return diceCount[i] * i
  }
  return 0
}



//Compute total score of scoreBoard
function calcTotal(scoreBoard){
  let total=0;
  for(let round=rounds.sum ; round<rounds.total;round++){
    total+=scoreBoard[round].score;
  }
  return total;
}

/* ***************************************************************************************************************
*  PLAYING a YATZY GAME: Playing a given round, and (for simplicity) playing all rounds in sequence
**************************************************************************************************************** */

//this function plays the 'roundNo' of 'scoreBoard', given 'diceRoll' 
function playRound(scoreBoard,roundNo,diceRoll){
  let diceCount=countDice(diceRoll);
  let score=0;
  switch(roundNo){
    case rounds.ones: 
    case rounds.twos:
    case rounds.threes: 
    case rounds.fours: 
    case rounds.fives:
    case rounds.sixes:
      score=calcSingle(roundNo+1,diceCount); //eg if 6s: 6*diceCount[6]; 
    break;
    case rounds.onePair:
       score=calcPair(diceCount);
    break;
    case rounds.twoPairs:
      score=calcTwoPairs(diceCount);
    break;
    case rounds.threeId:
      score=calcIdentical(diceCount,3);
    break; 
    case rounds.fourId:
      score=calcIdentical(diceCount,4);
    break; 
    case rounds.littleS:
      score=calcStraight(diceCount,1,5);
    break; 
    case rounds.bigS:
      score=calcStraight(diceCount,2,6);
    break; 
    case rounds.house:
      score=calcHouse(diceCount);
    break; 
    case rounds.chance:
      score=calcChance(diceCount);
    break;
    case rounds.yatzy:
      score=calcYatzy(diceCount);
    break; 
    default: 
      console.log("no such game round:"+roundNo);
    }
  noteScore(scoreBoard,roundNo,score,diceRoll); //record the score in scoreboard

  //compute sum,bonus, total and update scoreboard
  let sumScore=calcSum(scoreBoard);
  noteScore(scoreBoard,rounds.sum,sumScore,[]);
  let bonusScore= calcBonus(sumScore);
  noteScore(scoreBoard,rounds.bonus,bonusScore,[]);
  let totalScore=calcTotal(scoreBoard);
  noteScore(scoreBoard,rounds.total,totalScore,[]); 
}

//this function simply plays the game sequentially from top to bottum on the scoreboard
function playGame(){
  let scoreBoard1= newScoreBoard();
  for(let roundNo=0;roundNo<noRounds;roundNo++){
    if(!isSpecialRound(roundNo)) {
      let diceRoll=roll(M);  //r=[1,5,5,5,2,2,6]; //M=7
      playRound(scoreBoard1,roundNo,diceRoll);
      //printScores(scoreBoard1); //uncomment if you want to see the progress from every run
    }
  } 

  printScores(scoreBoard1);
  
  //let scoreTableAsString=printHTMLPage(scoreBoard1); //Placeholder for a future exercise
  //fs.writeFileSync("scores.html", scoreTableAsString);

}

//The programs "MAIN" function
playGame();
