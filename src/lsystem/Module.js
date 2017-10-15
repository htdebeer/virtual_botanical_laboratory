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
// A Module's private properties
const _name = new WeakMap();
const _parameters = new WeakMap();

/**
 * A Module represents a symbol in a LSystem.
 *
 * @property {String} name - the name of the module.
 * @property {Object[]} parameters - the parameters of this module.
 */
class Module {

    /**
     * Create a new Module
     *
     * @param {String} name - the module's name
     * @param {Object[]} [parameters = []] - the module's parameters, if any
     */
    constructor(name, parameters = []) {
        _name.set(this, name);
        _parameters.set(this, parameters);
    }

    get name() {
        return _name.get(this);
    }

    get parameters() {
        return _parameters.get(this);
    }

    /**
     * Is this Module equal to another module?
     *
     * @param {Module} other - the other module to compare this module with
     * @return {Boolean} True if the names are the same as well as their
     * number of parameters.
     */
    equals(other) {
        // console.log(`${this.name} === ${other.name} and ${this.parameters.length} === ${other.parameters.length}`);
        return this.name === other.name && this.parameters.length === other.parameters.length;
    }

    /**
     * Is this Module parameterized?
     *
     * @returns {Boolean} true if it has parameters.
     */
    isParameterized() {
        return 0 < this.parameters.length;
    }

    /**
     * Create a String representation of this Module.
     *
     * @returns {String}
     */
    stringify() {
        if (this.isParameterized()) {
            return `${this.name}(${this.parameters.map((p) => p.stringify()).join(",")})`;
        } else {
            return this.name;
        }
    }
}

export {
    Module
};
