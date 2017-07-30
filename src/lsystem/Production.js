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
const _predecessor = new WeakMap();
const _successor = new WeakMap();
const _condition = new WeakMap();

/**
 * A Production is a rewriting rule from a predecessor to a successor.
 *
 * @property {Predecessor} predecessor
 * @property {BooleanExpression} [condition = undefined] - productions in a
 * parameterized LSystem can have a condition guarding a production.
 * @property {Successor} successor
 */
class Production {
    /**
     * Create a new Production instance based on the predecessor, an optional
     * condition and a successor.
     *
     * @param {Predecessor} predecessor
     * @param {Successor} successor
     * @param {BooleanExpression} [condition = undefined]
     */
    constructor(predecessor, successor, condition = undefined) {
        _predecessor.set(this, predecessor);
        _successor.set(this, successor);
        _condition.set(this, condition);
    }

    get predecessor() {
        return _predecessor.get(this);
    }

    get successor() {
        return _successor.get(this);
    }

    get condition() {
        return _condition.get(this);
    }

    /**
     * Is this production conditional?
     *
     * @return {Boolean} True if this production has a condition.
     */
    isConditional() {
        return undefined !== this.condition;
    }

    /**
     * Follow this productions
     *
     * @param {NumericalExpression[]} [parameters = []] - an optional list of
     * parameters to check the condition and to apply to the successor of this
     * production.
     *
     * @returns {Successor} The successor of this Production with parameters
     * applied.
     */
    follow(parameters = []) {
        return this.successor.apply(parameters);
    }

    /**
     * Create a String representation of this Production.
     *
     * @return {String}
     */
    stringify() {
        let str = this.predecessor.stringify();
        if (this.isConditional()) {
            str += `: ${this.condition.stringify()}`;
        }
        str += ` -> ${this.successor.stringify()}`;
        return str;
    }
}

export {
    Production
}
