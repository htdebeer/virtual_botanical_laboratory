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
const _formalParameters = new WeakMap();
const _expression = new WeakMap();
const _evaluator = new WeakMap();

/**
 * An Expression can be evaluated to yield a value.
 *
 * @property {String} expression - a textual representation of this expression
 * @property {String[]} formalParameters - a list of formal parameter names
 */
class Expression {

    /**
     * Create a new instance of an Expression.
     *
     * @param {String[]} [formalParameters = []] - an optional list of formal
     * parameter names.
     * @param {Boolean|Number|undefined} [expression = undefined] - an optional expression
     * value, defaults to undefined.
     */
    constructor(formalParameters = [], expression = undefined) {
        _formalParameters.set(this, formalParameters);
        _expression.set(this, expression);
        _evaluator.set(this, new Function(...formalParameters, `return ${expression}`));
    }

    get formalParameters() {
        return _formalParameters.get(this);
    }

    get expression() {
        return _expression.get(this);
    }

    /**
     * Evaluate this Expression given an optional list of actual parameters.
     *
     * @param {Number[]|Boolean[]} [actualParameters = []] - an optional list
     * of actual parameters to apply to this Expression before evaluating the
     * Expression.
     *
     * @return {Number|Boolean|undefined} the result of the evaluating this
     * Expression.
     */
    evaluate(actualParameters = []) {
        return _evaluator.get(this).apply(undefined, actualParameters);
    }

    /**
     * Create a String representation of this Expression.
     *
     * @returns {String}
     */
    stringify() {
        return this.expression;
    }
}

export {
    Expression
}
