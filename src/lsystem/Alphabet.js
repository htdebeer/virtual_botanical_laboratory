/*
 * Copyright 2017 Huub de Beer <huub@heerdebeer.org>
 *
 * This file is part of virtual_botanical_laboratory.
 *
 * virtual_botanical_laboratory is free software: you can redistribute it
 * and/or modify it under the terms of the GNU General Public License as
 * published by the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * virtual_botanical_laboratory is distributed in the hope that it will be
 * useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General
 * Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with virtual_botanical_laboratory.  If not, see
 * <http://www.gnu.org/licenses/>.
 * 
 */
const _moduleDefinitions = new WeakMap();

/**
 * The Alphabet of an LSystem. The modules in an Alphabet are unique.
 */
class Alphabet {

    /**
     * Create a new instance of Alphabet.
     *
     * @param {Module[]} modules - a list of modules. 
     */
    constructor(modules) {
        _moduleDefinitions.set(this, []);
        for (const module of modules) {
            this.add(module);
        }
    }

    /**
     * Add a module to this Alphabet. If it already contains this module, an
     * error is thrown.
     *
     * @param {Module} module - the module to add
     * @throws {Error}
     */
    add(module) {
        if (this.has(module)) {
            throw new Error(`This alphabet already has a module '${module.stringify()}'.`);
        }
        _moduleDefinitions.get(this).push(module);
    }

    /**
     * Does this Alphabet have this module?
     *
     * @param {Module} module
     * @returns {Boolean} True if this Alphabet contains this module.
     */
    has(module) {
       return undefined !== this.get(module);
    }

    /**
     * Get a module from this Alphabet.
     *
     * @param {Module} module
     * @returns {Module|undefined} the module
     */
    get(module) {
       const found = _moduleDefinitions
            .get(this)
            .filter(
                (m) => 
                    m.name === module.name && 
                    m.parameters.every((p) => p in module.parameters)
            );
        return 1 === found.length ? found[0] : undefined;
    }

    /**
     * Create a String representation of this Alphabet.
     *
     * @returns {String}
     */
    stringify() {
        return _moduleDefinitions.get(this).map((m) => m.stringify()).join(", ");
    }

}

export {
    Alphabet
}
