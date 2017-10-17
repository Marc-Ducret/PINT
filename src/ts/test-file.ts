/**
 * This function gives the answer.
 * @returns {number} The answer
 */
export function giveMeTheAnswer() : number {
    return 42;
}

/**
 * Takes a number and returns this number plus a quantity between -0.5 and 0.5.
 * @param {number} a The base number.
 * @returns {number} The new number.
 */
export function randomModification(a: number) : number {
    return Math.random() + a - 0.5;
}
