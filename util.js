/**
 * A shuffle implementation using Yeast-Fischer algorithm.
 * This modifies the array passed to it. Mutating method.
 * @method shuffle
 * @param {array} array to shuffle
 * @return {array} shuffled array value.
 */
export default function shuffle(array) {
	let currentIndex = array.length,
		randomIndex;
	while (currentIndex > 0) {
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;
		[array[currentIndex], array[randomIndex]] = [
			array[randomIndex],
			array[currentIndex],
		];
	}
	return array;
}
