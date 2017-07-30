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

/**
 * A NumericalExpression, which yields a Number value when evaluated
 */
class NumericalExpression extends Expression {
    /**
     * Create a new NumericalExpression instance.
     *
     * @param {String[]} [formalParameter = []] - an optional list of formal
     * parameter names used in this NumericalExpression.
     * @param {Number} [expression = NaN] - an optional default value.
     */
    constructor(formalParameters = [], expression = NaN) {
        super(formalParameters, expression);
    }

    /**
     * Create a String representation of this NumericalExpression.
     *
     * @returns {String}
     */
    stringify() {
        return super
            .stringify()
            .replace(/\*\*/g, " ^ ");
    }

}

export {
    NumericalExpression
}
