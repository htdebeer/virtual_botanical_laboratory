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
import {ModuleTree} from "./ModuleTree.js";
import {Module} from "./Module.js";

const _module = new WeakMap();
const _leftContext = new WeakMap();
const _rightContext = new WeakMap();

const edgeMatches = function (predecessor, edge) {
    return predecessor.module.equals(edge);
};

const leftContextMatches = function (leftContext, pathTaken) {
    let match = false;
    if (pathTaken.length >= leftContext.length) {
        // leftContext fits in the path
        match = true;
        let reverseIndex = 1;
        while (match && reverseIndex <= leftContext.length) {
            const actual = pathTaken[pathTaken.length - reverseIndex];
            const formal = leftContext[leftContext.length - reverseIndex];

            match = match && actual.equals(formal);
            reverseIndex++;
        }
    }
    return match;
};

const rightContextMatches = function (rightContext, rightContextIndex, moduleTree, moduleTreeIndex, ignore = []) {
    let match = true;

    while (match && rightContextIndex < rightContext.length) {
        if (moduleTreeIndex >= moduleTree.length) {
            return false;
        }

        const actual = moduleTree[moduleTreeIndex];
        const formal = rightContext[rightContextIndex];
   
        if (formal instanceof ModuleTree) {
            match = match && 
                actual instanceof ModuleTree &&
                rightContextMatches(formal, 0, actual, 0, ignore);
            rightContextIndex++;
        } else {
            if (actual instanceof Module) {
                const ignored = ignore.filter(m => m.equals(actual));
                if (0 >= ignored.length) {
                    match = match && actual.equals(formal); 
                    rightContextIndex++;
                }
            } else {
                // See if the subtree is a match. If it isn't, ignore it and
                // continue at the current level. If it is a match, the rest
                // of the rightContext has been matched, so this is a match.
                if (rightContextMatches(rightContext, rightContextIndex, actual, 0, ignore)) {
                    return true;
                }
            }
        }
        moduleTreeIndex++;
    }

    return match;
};

/**
 * A Predecessor in a Production.
 *
 * @param {Module} module
 * @param {ModuleTree} [leftContext = undefined] - an optional left context
 * for context sensitive productions.
 * @param {ModuleTree} [rightContext = undefined] - an optional right context
 * for context sensitive productions.
 */
class Predecessor {
    /**
     * Create a new instance of Predecessor
     *
     * @param {Module} module - the module this predecessor is about.
     */
    constructor(module) {
        _module.set(this, module);
        _leftContext.set(this, undefined);
        _rightContext.set(this, undefined);
    }

    get module() {
        return _module.get(this);
    }

    set leftContext(context) {
        _leftContext.set(this, context);
    }

    get leftContext() {
        return _leftContext.get(this);
    }

    /**
     * Has this predecessor a left context?
     *
     * @returns {Boolean}
     */
    hasLeftContext() {
        return undefined !== this.leftContext;
    }

    set rightContext(context) {
        _rightContext.set(this, context);
    }

    get rightContext() {
        return _rightContext.get(this);
    }

    /**
     * Has this predecessor a right context?
     *
     * @returns {Boolean}
     */
    hasRightContext() {
        return undefined !== this.rightContext;
    }

    /**
     * Is this a context sensitive predecessor?
     *
     * @returns {Boolean} True if this predecessor has a left context, a right
     * context, or both contexts.
     */
    isContextSensitive() {
        return this.hasLeftContext() || this.hasRightContext();
    }

    /**
     * Is this a context free predecessor?
     *
     * @returns {Boolean} True if this precessor does not care about the
     * context.
     */
    isContextFree() {
        return !this.isContextSensitive();
    }

    /**
     * Does this predecessor match a given module?
     *
     * @param {Module} edge - the module to match against this predecessor.
     * @param {ModuleTree} moduleTree - the sub tree in the predecessor the
     * module is part of
     * @param {Module[]} [pathTaken = []] - the path taken to reach module,
     * this is the left context
     * @param {Integer} [edgeIndex = 0] - the index of module in moduleTree.
     * This is used to determine the right context.
     * @param {Module[]} [ignore = []] - a list with modules to ignore when
     * determining the right context.
     *
     * @returns{Boolean} True if the module matches agains this predecessor,
     * i.e, they are equal and the context matches.
     */
    matches(edge, moduleTree, pathTaken, edgeIndex, ignore = []) {
        let left = true;
        let right = true;
        
        if (this.hasLeftContext()) {
            left =  leftContextMatches(this.leftContext, pathTaken);
        }

        if (this.hasRightContext()) {
            right = rightContextMatches(this.rightContext, 0, moduleTree, edgeIndex + 1, ignore);
        }

        return left && edgeMatches(this, edge) && right;
    }

    /**
     * Create a String representation of this Predecessor.
     *
     * @returns {String}
     */
    stringify() {
        let str = "";
        if (this.hasLeftContext()) {
            str += `${this.leftContext.stringify()} < `;
        }
        str += this.module.stringify();
        if (this.hasRightContext()) {
            str += ` > ${this.rightContext.stringify()}`;
        }
        return str;
    }

}

export {
    Predecessor
}
