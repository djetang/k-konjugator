//Welcome to the conjugator! 

const Hangul = require('hangul-js');
const validTenses = ['past', 'present', 'future'];
const validLevels = ['informalLow', 'informalHigh', 'formalHigh'];
const validVowels = ['ㅏ','ㅑ','ㅓ','ㅕ','ㅗ','ㅛ','ㅜ','ㅠ','ㅡ','ㅣ','ㅐ','ㅒ','ㅔ','ㅖ']
const irregularVerbEnd = ['ㅅ', 'ㄷ', 'ㅂ', 'ㅡ']
const irregularVerbWord = ['르']
const bieutExceptionsOh = ['돕다', '곱다']
const irregularExceptions = ['웃다','벗다','씻다','걷다','받다','묻다','닫다','좁다','잡다','넓다','따르다']

/**
 * 
 *@returns {string[]} 
 */
function showMeTheBlocks(word) {
    return word.split('')
} //should return an array of word blocks

function isThisSomething(word, whatMightItBe) {
    if (word.length < whatMightItBe.length)
        return false;
    else 
        return word.lastIndexOf(whatMightItBe) === word.length - whatMightItBe.length;
}

function isThisDah(word) {
    return isThisSomething(word, '다');
}

function isThisHaDah(word){
    return isThisSomething(word, '하다');
}

function isThisSibNiDah(word){
    return isThisSomething(word, '습니다');
}

function isThisIbNiDah(word){
    return isThisSomething(word, '입니다');
}

function identifyLastStem(word) {
    const cutdah = cutTheLastDah(word)
    const cuthadah = cutTheLastHaDah(word)
    if (isThisHaDah(word))
        return (cuthadah.substring(cuthadah.length-1, cuthadah.length)); /*this specific one is the same as identifyFirstStem */
    else if (isThisDah(word))
        return (cutdah.substring(cutdah.length-1, cutdah.length));
    else return ('this aint a verb again')
} //finds the last block before 다/하다

function lastStemLetters(word) {
    const lastStem = identifyLastStem(word)
    return Hangul.disassemble(lastStem)
} //should return an array of the last hangul letter, split up

function veryLastLetter(word){
    const stemletters = lastStemLetters(word)
    return stemletters[stemletters.length-1];
} //returns only the very last Hangul letter of the stem

function isThisWah(word) {
    const letters = lastStemLetters(word)
    return ( (letters[1] === 'ㅗ' && letters[2] !== 'ㅐ') &&
                (letters[1] === 'ㅗ' && letters[2] !== 'ㅣ')) ||
        letters[1] === 'ㅏ' ;
}

function cutTheLastDah(word) {
    const allBlocks = showMeTheBlocks(word)
    return (word.substring(0,(allBlocks.length-1)))
} //shows just the word stem without 다

function cutTheLastDahLetters(word) {
    const blocks = cutTheLastDah(word)
    return Hangul.disassemble(blocks);
} //shows just the word stem without 다 as an array of letters

function cutTheLastHaDah(word) {
    const allBlocks = showMeTheBlocks(word)
    return (word.substring(0,(allBlocks.length-2)));
} //shows just the word stem without 하다

function cutTheLastHaDahLetters(word) {
    const blocks = cutTheLastHaDah(word)
    return Hangul.disassemble(blocks);
} //shows just the word stem without 하다 as an array of letters

function handleFormalHighPresent(cut, veryLL, level, tense){
    if (validVowels.includes(veryLL))
        return Hangul.assemble ([...cut, ...conjugations[level][tense]['아'].slice(2)]); 
    else
        return Hangul.assemble ([...cut, ...conjugations[level][tense]['아']]); 
}

function handleAllWah(cut, veryLL, level, tense){
    const oneshortcut = (cut.slice(0,cut.length-1))
    if (veryLL == 'ㅗ' && (tense == 'past' || tense == 'present'))
        return Hangul.assemble ([...cut, ...conjugations[level][tense]['아'].slice(1)]); /** ㅗ:  delete ㅇ,  assemble */
    else if (veryLL == 'ㅏ' && (tense == 'past' || tense == 'present'))
        return Hangul.assemble ([...oneshortcut, ...conjugations[level][tense]['아'].slice(1)]); /** ㅏ: delete ㅇ, ㅏ, assemble */
    else if (((veryLL == 'ㅗ') || (veryLL == 'ㅏ')) && tense == 'future')
        return Hangul.assemble ([...cut, 'ㄹ', ...(conjugations[level][tense]['아'])]);
    else if ((veryLL !== 'ㅗ' || veryLL !== 'ㅏ') && (tense == 'past' || tense == 'present'))
        return Hangul.assemble ([...cut, ...conjugations[level][tense]['아']]);
    else 
        return Hangul.assemble ([...cut, 'ㅇ', 'ㅡ', 'ㄹ', ...conjugations[level][tense]['아']]);
}

function handleSiot(cut, veryLL, word, level, tense){
    const stemletters = lastStemLetters(word)
    const oneshortLL = stemletters[stemletters.length-2]
    const oneshortcut = (cut.slice(0,cut.length-1))
    if (tense === 'past')
        return handleAsRegulars(oneshortcut, oneshortLL, word, level, tense);
    else if (tense === 'present' && (level === 'informalLow' || level === 'informalHigh'))
        return handleAsRegulars(oneshortcut, oneshortLL, word, level, tense);
    else 
        return handleAsRegulars(cut, veryLL, word, level, tense);
}

function handleDieut(cut, veryLL, word, level, tense){
    const addARu = [...(cut.slice(0,cut.length-1)),'ㄹ']
    if (tense === 'past')
        return handleAsRegulars(addARu, 'ㄹ', word, level, tense);
    else if (tense === 'present' && (level === 'informalLow' || level === 'informalHigh'))
        return handleAsRegulars(addARu, 'ㄹ', word, level, tense);
    else 
        return handleAsRegulars(cut, veryLL, word, level, tense);
}

function handleBieut(cut, veryLL, word, level, tense){
    const newOCut = ([...cut.slice(0, cut.length-1), 'ㅇ', 'ㅗ'])
    const newUCut = ([...cut.slice(0, cut.length-1), 'ㅇ', 'ㅜ'])
    const newOLL = 'ㅗ'
    const newULL = 'ㅜ'
    if (bieutExceptionsOh.includes(word))
        if (tense === 'past')
            return Hangul.assemble ([...newOCut, ...conjugations[level][tense]['아'].slice(1)]) /** delete ㅇ, assemble */
        else if (tense === 'present' && (level === 'informalLow' || level === 'informalHigh'))
            return Hangul.assemble ([...newOCut, ...conjugations[level][tense]['아'].slice(1)]) /** delete ㅇ, assemble */
        else 
            return handleAsRegulars(cut, veryLL, word, level, tense);
    else
        if (tense === 'past')
            return Hangul.assemble ([...newUCut, ...conjugations[level][tense]['어'].slice(1)]) /** delete ㅇ, assemble */
        else if (tense === 'present' && (level === 'informalLow' || level === 'informalHigh'))
            return Hangul.assemble ([...newUCut, ...conjugations[level][tense]['어'].slice(1)]) /** delete ㅇ, assemble */
        else 
            return handleAsRegulars(cut, veryLL, word, level, tense);
}   

function handleEu(cut, veryLL, word, level, tense){
    const oneshortcut = (cut.slice(0,cut.length-1))
    const decidingLL = findTheVowel(cut)
    if (decidingLL == ('ㅗ') || decidingLL == ('ㅏ'))
        if (tense === 'past')
            return Hangul.assemble ([...oneshortcut, ...conjugations[level][tense]['아'].slice(1)]) /** delete ㅇ, assemble */
        else if (tense === 'present' && (level === 'informalLow' || level === 'informalHigh'))
            return Hangul.assemble ([...oneshortcut, ...conjugations[level][tense]['아'].slice(1)]) /** delete ㅇ, assemble */
        else 
            return handleAsRegulars(cut, veryLL, word, level, tense);
    else
        if (tense === 'past')
            return Hangul.assemble ([...oneshortcut, ...conjugations[level][tense]['어'].slice(1)]) /** delete ㅇ, assemble */
        else if (tense === 'present' && (level === 'informalLow' || level === 'informalHigh'))
            return Hangul.assemble ([...oneshortcut, ...conjugations[level][tense]['어'].slice(1)]) /** delete ㅇ, assemble */
        else 
            return handleAsRegulars(cut, veryLL, word, level, tense);
}

function handleReu(cut, veryLL, word, level, tense){
    const addTwoRu = [...(cut.slice(0,cut.length-2)),'ㄹ', 'ㄹ']
    const decidingLL = findTheVowel(cut)
    if (decidingLL == ('ㅗ') || decidingLL == ('ㅏ'))
        if (tense === 'past')
            return Hangul.assemble ([...addTwoRu, ...conjugations[level][tense]['아'].slice(1)]) /** delete ㅇ, assemble */
        else if (tense === 'present' && (level === 'informalLow' || level === 'informalHigh'))
            return Hangul.assemble ([...addTwoRu, ...conjugations[level][tense]['아'].slice(1)]) /** delete ㅇ, assemble */
        else 
            return handleAsRegulars(cut, veryLL, word, level, tense);
    else
        if (tense === 'past')
            return Hangul.assemble ([...addTwoRu, ...conjugations[level][tense]['어'].slice(1)]) /** delete ㅇ, assemble */
        else if (tense === 'present' && (level === 'informalLow' || level === 'informalHigh'))
            return Hangul.assemble ([...addTwoRu, ...conjugations[level][tense]['어'].slice(1)]) /** delete ㅇ, assemble */
        else 
            return handleAsRegulars(cut, veryLL, word, level, tense);
}

function findTheVowel(cut){
    if (cut.length < 3)
        return 'ㅓ';
    else if (validVowels.includes(cut[cut.length-3]))
        return cut[cut.length-3];
    else if (validVowels.includes(cut[cut.length-4]))
        return cut[cut.length-4];
    else
        return 'something wrong'
}

function handleAllIrregulars(cut, veryLL, word, level, tense){
    const lastBlock = identifyLastStem(word)
    if (veryLL == 'ㅅ')
        return handleSiot(cut, veryLL, word, level, tense);
    else if (veryLL == 'ㄷ')
        return handleDieut(cut, veryLL, word, level, tense);
    else if (veryLL == 'ㅂ')
        return handleBieut(cut, veryLL, word, level, tense);
    else if (veryLL == 'ㅡ')
       return handleEu(cut, veryLL, word, level, tense);
    else if (lastBlock == '르')
        return handleReu(cut, veryLL, word, level, tense);
    else
        return 'i dont think there are any more irregulars..?';
}

function handleAsRegulars(cut, veryLL, word, level, tense){
    const oneshortcut = (cut.slice(0,cut.length-1))
    if (level == 'formalHigh' && tense == 'present') /** for 습니다 / ~ㅡㅂ 니다 */
        return handleFormalHighPresent(cut, veryLL, level, tense);
    else if ((veryLL == ('ㅜ' || 'ㅡ')) && tense == ('past' || 'present'))
        return Hangul.assemble ([...cut, ...conjugations[level][tense]['어'].slice(1)]); /** ㅜ or ㅡ: delete ㅇ, assemble */
    else if ((veryLL == ('ㅓ' || 'ㅕ')) && tense == ('past' || 'present'))
        return Hangul.assemble ([...cut, ...conjugations[level][tense]['어'].slice(2)]); /** ㅓ or ㅕ: delete ㅇ, ㅓ, assemble */
    else if (veryLL == 'ㅣ' && tense == ('past' || 'present'))
        return Hangul.assemble ([...cut.slice(0,cut.length-1), 'ㅕ', ...conjugations[level][tense]['어'].slice(2)]); /**ㅣ: delete ㅣ,ㅇ,ㅓ, add 여, assemble */
    else if (isThisWah(word))
        return handleAllWah(cut, veryLL, level, tense);
    else if (validVowels.includes(veryLL) && tense == ('future')) 
        return Hangul.assemble ([...cut, 'ㄹ', ...conjugations[level][tense]['어']]); /** future tense with vowel ending */
    else if (tense == 'future')
        return Hangul.assemble ([...cut, 'ㅇ', 'ㅡ', 'ㄹ', ...conjugations[level][tense]['어']]); /** future tense with consonant ending */
    else 
        return Hangul.assemble ([...cut, ...conjugations[level][tense]['어']]); /** all others without vowel ending */
}

function conjugateDahYo(word,level,tense) {
    const cut = cutTheLastDahLetters(word)
    const veryLL = veryLastLetter(word)
    if (irregularExceptions.includes(word))
        return handleAsRegulars(cut, veryLL, word, level, tense);
    else if (irregularVerbEnd.includes(veryLL))
        return handleAllIrregulars(cut, veryLL, word, level, tense);
    else
        return handleAsRegulars(cut, veryLL, word, level, tense);
}

function conjugateHaDahYo(word,level,tense) {
    const cut = cutTheLastHaDahLetters(word)
    return Hangul.assemble ([...cut, ...conjugations[level][tense]['하']]);
    }

function kKonjugator (word,level,tense){
    if (!validLevels.includes(level) || (!validTenses.includes(tense)))
        return 'include a proper tense!';
    else 
        if (isThisHaDah(word)) 
            return conjugateHaDahYo(word,level,tense);
        else if (isThisSibNiDah(word))
            return 'Give me the dictionary form, this is the formal form!';
        else if (isThisIbNiDah(word))
            return 'this is the formal form of TO BE';
        else if (isThisDah(word))
            return conjugateDahYo(word,level,tense);
        else  
            return 'this doesnt look like a dictionary form verb to me';
}

let conjugations = {
    informalLow: {
        past:{
            아: ['ㅇ','ㅏ','ㅆ','ㅇ','ㅓ'], /* ㅗ merge, ㅏ collapse */
            어: ['ㅇ','ㅓ','ㅆ','ㅇ','ㅓ'], /*  */
            하: ['ㅎ','ㅐ','ㅆ','ㅇ','ㅓ'],
        },
        present:{
            아: ['ㅇ','ㅏ'],
            어: ['ㅇ','ㅓ'],
            하: ['ㅎ','ㅐ'],
        },
        future:{
            아: ['ㄱ','ㅔ','ㅆ','ㅇ','ㅓ'],
            어: ['ㄱ','ㅔ','ㅆ','ㅇ','ㅓ'],
            하: ['ㅎ','ㅏ','ㄹ','ㄱ','ㅓ','ㅇ','ㅑ'],
        },
    },
    informalHigh: {
        past:{
            아: ['ㅇ','ㅏ','ㅆ','ㅇ','ㅓ','ㅇ','ㅛ'],
            어: ['ㅇ','ㅓ','ㅆ','ㅇ','ㅓ','ㅇ','ㅛ'],
            하: ['ㅎ','ㅐ','ㅆ','ㅇ','ㅓ','ㅇ','ㅛ'],
        },
        present:{
            아: ['ㅇ','ㅏ','ㅇ','ㅛ'],
            어: ['ㅇ','ㅓ','ㅇ','ㅛ'],
            하: ['ㅎ','ㅐ','ㅇ','ㅛ'],
        },
        future:{
            아: ['ㄱ','ㅔ','ㅆ','ㅇ','ㅓ','ㅇ','ㅛ'],
            어: ['ㄱ','ㅔ','ㅆ','ㅇ','ㅓ','ㅇ','ㅛ'],
            하: ['ㅎ','ㅏ','ㄹ','ㄱ','ㅓ','ㅇ','ㅖ','ㅇ','ㅛ'],
        },
    },
    formalHigh: {
        past:{
            아: ['ㅇ','ㅏ','ㅆ','ㅅ','ㅡ','ㅂ','ㄴ','ㅣ','ㄷ','ㅏ'],
            어: ['ㅇ','ㅓ','ㅆ','ㅅ','ㅡ','ㅂ','ㄴ','ㅣ','ㄷ','ㅏ'],
            하: ['ㅎ','ㅐ','ㅆ','ㅅ','ㅡ','ㅂ','ㄴ','ㅣ','ㄷ','ㅏ'],
        },
        present:{
            아: ['ㅅ','ㅡ','ㅂ','ㄴ','ㅣ','ㄷ','ㅏ'], 
            어: ['ㅅ','ㅡ','ㅂ','ㄴ','ㅣ','ㄷ','ㅏ'],
            하: ['ㅎ','ㅏ','ㅂ','ㄴ','ㅣ','ㄷ','ㅏ'],
        },
        future:{
            아: ['ㄱ','ㅓ','ㅂ','ㄴ','ㅣ','ㄷ','ㅏ'], 
            어: ['ㄱ','ㅓ','ㅂ','ㄴ','ㅣ','ㄷ','ㅏ'],
            하: ['ㅎ','ㅏ','ㄹ',' ','ㄱ','ㅓ','ㅅ','ㅇ','ㅣ','ㅂ','ㄴ','ㅣ','ㄷ','ㅏ'],
        },
    }
};

module.exports = { kKonjugator };
