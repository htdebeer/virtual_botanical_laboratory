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
const _module = new WeakMap();
const _leftContext = new WeakMap();
const _rightContext = new WeakMap();

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
     * @param {Module} module - the module to match against this predecessor.
     * @param {ModuleTree} [leftContext = undefined] - an optional left
     * context to match.
     * @param {ModuleTree} [rightContext = undefined] - an optional right
     * context to match.
     * @returns {Boolean} True if the module matches agains this predecessor,
     * i.e, they are equal and the context matches.
     */
    matches(module, leftContext = undefined, rightContext = undefined) {
        return this.module.equals(module);
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
