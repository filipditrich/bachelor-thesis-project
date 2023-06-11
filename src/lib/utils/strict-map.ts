/**
 * Map with strict get method
 * @author filipditrich <ditrich@nfctron.com>
 * @extends {Map<K, V>}
 * @template K
 * @template V
 * @returns {StrictMap<K, V>}
 */
export class StrictMap<K, V> extends Map<K, V> {
	/**
	 * Returns value for given key but throws error if key does not exist.
	 * @override
	 * @method get
	 * @param {K} key
	 * @returns {V}
	 */
	get(key: K): V {
		if (!this.has(key)) throw new Error(`[StrictMap] key "${key}" does not exist!`);
		return super.get(key)!;
	}

	/**
	 * Returns list of entries as array
	 * @returns {[K, V][]}
	 */
	toArray(): [K, V][] {
		return Array.from(this.entries());
	}
}
