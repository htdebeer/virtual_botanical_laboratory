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
import {Module} from "./Module.js";
import {ModuleValue} from "./ModuleValue.js";

const _expressions = new WeakMap();

/**
 * A ModuleApplication defines a module in a successor of a production
 *
 * @property {Number[]} values
 */
class ModuleApplication extends Module {

    constructor(name, moduleDefinition, actualParameters) {
        const formalParameters = moduleDefinition.parameters;

        if (formalParameters.length !== actualParameters.length) {
            throw new Error(`Number of actual parameters (${actualParameters.lenght}) should be equal to the number of formal parameters (${formalParameters.length}).`);
        }

        super(name, formalParameters);

        const expressions = {};

        for (let index = 0; index < formalParameters.length; index++) {
            const name = formalParameters[index];
            expressions[name] = actualParameters[index];
        }

        _expressions.set(this, expressions);
    }

    /**
     * Get the value of a parameter.
     *
     * @param {String} name - the name of the parameter to get
     * @return {Number} the value of this parameter, or undefined if it does
     * not exist.
     */
    getExpression(name) {
        return _expressions.get(this)[name];
    }

    apply(parameters) {
        const values = [];
        for (const name of this.parameters) {
            const expr = this.getExpression(name);
            const actualParameters = expr.formalParameters.map((p) => parameters[p]);
            const value = this.getExpression(name).evaluate(actualParameters);
            values.push(value);
        }
        return new ModuleValue(this.name, this, values);
    }

    /**
     * Create a String representation of this Module.
     *
     * @returns {String}
     */
    stringify() {
        if (this.isParameterized()) {
            return `${this.name}(${Object.values(_expressions.get(this)).map(e => e.stringify()).join(',')})`;
        } else {
            return this.name;
        }
    }
}

export {
    ModuleApplication
}
