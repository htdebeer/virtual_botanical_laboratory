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
 * A BooleanExpression
 */
class BooleanExpression extends Expression {
    /**
     * Create a new instance of a BooleanExpression.
     *
     * @param {String[]} [formalParameters = []] - an optional list of formal
     * parameter names.
     * @param {Boolean} [expression = true] - an optional default value for
     * this BooleanExpression.
     */
    constructor(formalParameters = [], expression = true) {
        super(formalParameters, expression);
    }

    /**
     * Create a String representation of this BooleanExpression.
     *
     * @returns {String}
     */
    stringify() {
        return super
            .stringify()
            .replace(/&&/g, " and ")
            .replace(/\|\|/g, " or ")
            .replace(/!/g, " not ")
            .replace(/===/g, "=")
            .replace(/!==/g, "!=");
    }
}

export {
    BooleanExpression
}
