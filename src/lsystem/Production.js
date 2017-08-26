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

const determineParameters = function (production, edge, globalContext = {}) {
    const formalParameters = production.predecessor.module.parameters.reduce((ps, p) => {
        return ps.concat([p]);
    }, []);

    const parameters = Object.assign({}, globalContext);

    formalParameters.forEach((name) => {
        const actualValue = edge.getValue(name);
        if (undefined !== actualValue) {
            parameters[name] = actualValue;
        }
    });

    return parameters;
}

const conditionHolds = function (production, edge) {
    if (!production.isConditional()) {
        // No condition always holds
        return true;
    }

    const parameters = determineParameters(production, edge);
    const condition = production.condition;
    const value = condition.evaluate(determineParameters(production, edge));
    return production.condition.evaluate(determineParameters(production, edge));
};

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
     * Does this production match the edge?
     *
     * @param {Module} edge - the edge to match against this production
     * @returns {Boolean} True if this production matches the edge
     */
    matches(edge, moduleTree, pathTaken, edgeIndex, ignore = []) {
        if (this.isConditional() && !conditionHolds(this, edge)) {
            return false;
        }
        return this.predecessor.matches(edge, moduleTree, pathTaken, edgeIndex, ignore);
    }

    /**
     * Follow this productions
     *
     * @param {Module} edge - the actual module to apply this production to.
     * @param {Object} [globalContext = {}] - the globalContext in which this
     * edge is followed.
     *
     * @returns {Successor} The successor of this Production with parameters
     * applied.
     */
    follow(edge, globalContext = {}) {
        if (this.predecessor.module.isParameterized()) {
            // In each production, the predecessor is exactly one module. However,
            // its successor can consist of one or more modules. Construct a map
            // of formal parameters to their current actual value (based on the
            // edge)
            return this.successor.apply(determineParameters(this, edge, globalContext));
        } else {
            return this.successor.apply();
        }
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
