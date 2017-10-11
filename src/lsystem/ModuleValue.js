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
import {Expression} from "./Expression.js";
import {Module} from "./Module.js";

const _values = new WeakMap();

/**
 * A ModuleValue defines an actual module in a string.
 *
 * @property {Number[]} values
 */
class ModuleValue extends Module {

    constructor(name, moduleDefinition, actualParameters) {
        const formalParameters = moduleDefinition.parameters;

        if (formalParameters.length !== actualParameters.length) {
            throw new Error(`Number of actual parameters (${actualParameters.length}) should be equal to the number of formal parameters (${formalParameters.length}).`);
        }

        super(name, formalParameters);

        const values = {};

        for (let index = 0; index < formalParameters.length; index++) {
            const name = formalParameters[index];
            const value = actualParameters[index];
            values[name] = value instanceof Expression ? value.evaluate() : value;
        }

        _values.set(this, values);
    }

    get values() {
        return _values.get(this);
    }

    /**
     * Get the value of a parameter.
     *
     * @param {String} name - the name of the parameter to get
     * @return {Number} the value of this parameter, or undefined if it does
     * not exist.
     */
    getValue(name) {
        return _values.get(this)[name];
    }

    /**
     * Create a String representation of this Module.
     *
     * @returns {String}
     */
    stringify() {
        if (this.isParameterized()) {
            return `${this.name}(${Object.values(_values.get(this)).join(",")})`;
        } else {
            return this.name;
        }
    }
}

export {
    ModuleValue
};
