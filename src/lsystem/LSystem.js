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
import {Successor} from "./Successor.js";
import {IdentityProduction} from "./IdentityProduction.js";
import {Parser} from "./Parser.js";

const _alphabet = new WeakMap();
const _axiom = new WeakMap();
const _productions = new WeakMap();
const _ignore = new WeakMap();

const _currentDerivation = new WeakMap();
const _derivationLength = new WeakMap();

const leftContext = function (lsystem) {
    return undefined;
};

const rightContext = function (lsystem) {
    return undefined;
};

const selectBestProduction = function (lsystem, productions) {
    if (1 === productions.length) {
        return productions[0];
    } else {
        // For context-sensitive L-systems, there can be multiple rules that
        // match. If so, choose the most specific one: a context-sensitive rule
        // has precedence over a context-free one. 
        //
        // If multiple context-sensitive
        // rules apply, choose the one with the longest matching context (?)

        return productions[0];
    }
};

const findProduction = function (lsystem, module, context) {
    const candidates = lsystem
        .productions
        .filter((p) => p.predecessor.matches(module, leftContext(lsystem), rightContext(lsystem)));

    if (0 < candidates.length) {
        return selectBestProduction(lsystem, candidates);
    } else {
        // Modules that do not match any production are copied to the
        // successor directly. This is also known as the 'identity' production
        // rule.
        return new IdentityProduction(module);
    }
};

const derive = function(lsystem, moduleTree, context) {
    const successor = new Successor();

    for (const node of moduleTree) {
        if (node instanceof ModuleTree) {
            successor.push(derive(lsystem, node, context));
        } else {
            const production = findProduction(lsystem, node, context);
            const rewrittenNode = production.follow();

            for (const successorNode of rewrittenNode) {
                successor.push(successorNode);
            }
        }
    }

    return successor;
};

/**
 * An LSystem model
 *
 * @property {Alphabet} alphabet - the set of modules of this LSystem
 * @property {ModuleTree} axiom - the axion of this LSystem
 * @property {Production[]} productions - the set of productions of this
 * LSystem
 * @property {Integer} derivationLength - the length of the derivation of this
 * LSystem
 */
const LSystem = class {
    /**
     * Create a new instance of LSystem.
     *
     * @param {Alphabet} alphabet
     * @param {ModuleTree} axiom
     * @param {Production[]} productions
     * @param {Module[]} ignore
     */
    constructor(alphabet, axiom, productions, ignore = []) {
        _alphabet.set(this, alphabet);
        _axiom.set(this, axiom);
        _productions.set(this, productions);
        _ignore.set(this, ignore);

        this.reset();
    }

    /**
     * Parse an LSystem input string and return the represented LSystem.
     *
     * @param {String} input
     * @returns {LSystem} the parsed LSystem
     * @throws {ParseError|LexicalError} if something goes wrong during
     * parsing, an error is thrown.
     */
    static parse(input) {
        return (new Parser()).parse(input);
    }

    get alphabet() {
        return _alphabet.get(this);
    }

    get axiom() {
        return _axiom.get(this);
    }

    get productions() {
        return _productions.get(this);
    }

    get ignore() {
        return _ignore.get(this);
    }

    get derivationLength() {
        return _derivationLength.get(this);
    }

    /**
     * Create a String representation of this LSystem. This representation can
     * be parsed again to an LSystem equal to this one.
     *
     * @return {String}
     */
    stringify() {
        let lsystem = `lsystem(alphabet: {${this.alphabet.stringify()}}, axiom: ${this.axiom.stringify()}, productions: {${this.productions.map((p) => p.stringify()).join(", ")}}`;

        if (0 < this.ignore.length) {
            lsystem += `, ignore: {${this.ignore.map(m => m.stringify()).join(", ")}}`;
        }
        lsystem += `)`;
        return lsystem;
    }

    /**
     * Taking the current state of this LSystem as the predecessor, derive a
     * successor.
     *
     * @param {Number} [steps = 1] - the number of derivations to perform,
     * defaults to one step.
     *
     * @returns {Successor} the successor.
     */
    derive(steps = 1) {
        for (let i = 0; i < steps; i++) {
            // do a derivation
            const predecessor = _currentDerivation.get(this);
            _currentDerivation.set(this, derive(this, predecessor, predecessor));
            _derivationLength.set(this, this.derivationLength + 1);
        }
        return _currentDerivation.get(this);
    }

    /**
     * Reset the LSystem to the starting state.
     */
    reset() {
        _currentDerivation.set(this, this.axiom);
        _derivationLength.set(this, 0);
    }
};

export {
    LSystem
};
