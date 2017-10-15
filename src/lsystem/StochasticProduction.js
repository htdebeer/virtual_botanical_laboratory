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
import {Production} from "./Production.js";


const _successorList = new WeakMap();


const setupProbabilityMapping = function (production, successorList) {
    let lower = 0;
    for (const successor of successorList) {
        if (0 >= successor.probability || successor.probability > 1) {
            throw new Error("Probability should be between 0 and 1");
        }

        successor.lower = lower;
        successor.upper = successor.lower + successor.probability;
        lower = successor.upper;
    }

    if (1 !== successorList.reduce((sum, pair) => sum += pair.probability, 0)) {
        throw new Error("Total probability should be 1");
    }

    _successorList.set(production, successorList);
};

/**
 * A StochasticProduction is a production with multiple possible rewriting
 * rules, each with a probability indicating the chance it will be chosen to
 * be used. The sum of the probabilities should be 1.
 *
 * @property {Successor} a successor is randomly chosen given the probability
 * of the rewriting rules of this StochasticProduction.
 */
class StochasticProduction extends Production {
    /**
     * Create a new instance of StochasticProduction.
     *
     * @param {Predecessor} predecessor
     * @param {Object[]} successor - pairs of successors and their
     * probabilities
     * @param {Number} successor.probability - the probability of the successor
     * @param {Successor} successor.successor - the successor
     * @param {BooleanExpression} [condition = undefined] - an optional
     * condition for this StochasticProduction.
     */
    constructor(predecessor, successors, condition = undefined) {
        super(predecessor, undefined, condition);
        setupProbabilityMapping(this, successors);
    }

    get successor() {
        const random = Math.random();
        const succ =  _successorList
            .get(this)
            .filter(
                (successor) => successor.lower <= random && random < successor.upper
            )[0].successor;
        return succ;
    }
   
    /**
     * Create a String representation of this StochasticProduction.
     *
     * @returns {String}
     */ 
    stringify() {
        let str = this.predecessor.stringify();
        if (this.isConditional()) {
            str += `: ${this.condition.stringify()}`;
        }
        str += "{\n";
        str += _successorList
            .get(this)
            .map((successor) => `\t${successor.probability} -> ${successor.successor.stringify()}`)
            .join(",\n");
        str += "\n}";
        return str;
    }
}

export {
    StochasticProduction
};
