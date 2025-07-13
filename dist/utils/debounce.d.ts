/**
 * Debounce function: delays execution of `fn` until after `delay` ms have passed
 * since the last time it was invoked.
 *
 * @param {TimerHandler} fn - The function to debounce
 * @param {number} delay - The delay in milliseconds
 * @returns {Function}
 */
export declare function debounce(fn: (...args: any[]) => void, delay?: number): Function;
