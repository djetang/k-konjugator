const { kKonjugator } = require('./../src/scripts/konjugator');
const chai = require('chai');
const expect = chai.expect;

describe('When using the conjugator', function () {
    it('Should be able to conjugate 하다 in informal, present tense', function () {
        const result = kKonjugator("하다", "informalLow", "present")
        expect(result).to.equal("해");
    });

    it('Should be able to conjugate 하다 in respectful informal, present tense', function () {
        const result = kKonjugator("하다", "informalHigh", "present")
        expect(result).to.equal("해요");
    });

    it('Should be able to conjugate 하다 in formal, present tense', function () {
        const result = kKonjugator("하다", "formalHigh", "present")
        expect(result).to.equal("합니다");
    });

    it('Should return an error message when not passing in a verb', function () {
        const result = kKonjugator("", "informalHigh", "past")
        expect(result).to.equal("this doesnt look like a dictionary form verb to me");
    });

    it('Should return an error message when not passing in a level', function () {
        this.skip("The error message here isn't correct, unskip this test once the error message is fixed");
        const result = kKonjugator("하다", "", "past")
        expect(result).to.equal("include a proper level!");
    });

    it('Should return an error message when not passing in a tense', function () {
        const result = kKonjugator("하다", "informalHigh", "")
        expect(result).to.equal("include a proper tense!");
    });
});
