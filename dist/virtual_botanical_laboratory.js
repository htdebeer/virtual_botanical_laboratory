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
/**
 * An error during the lexical analysis phase while parsing an LSystem input
 * string.
 */
class LexicalError extends Error {
}

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
/**
 * A Error encountered while parsing a LSystem input string.
 */
class ParseError extends Error {
}

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

const stringifyModuleTree = function (tree) {
    const converted = [];
    for (const node of tree) {
        if (node instanceof ModuleTree) {
            converted.push("[");
            converted.push(stringifyModuleTree(node));
            converted.push("]");
        } else {
            converted.push(node.stringify());
        }
    }
    return converted.join(" ");
};

const flatten = function (moduleTree) {
    let modules = [];
    for (const item of moduleTree) {
        if (item instanceof ModuleTree) {
            modules = modules.concat(flatten(item));
        } else {
            modules.push(item);
        }
    }
    return modules;
};

/**
 * A ModuleTree.
 */
class ModuleTree extends Array {
    /**
     * Create a new ModuleTree instance with an initial list of nodes, if any.
     *
     * @param {Module|ModuleTree} [nodes = []] - an initial list of nodes for
     * this new ModuleTree
     */
    constructor(nodes = []) {
        super();
        for (const node of nodes) {
            this.push(node);
        }
    }

    /**
     * Iterator yielding each module in this ModuleTree, via a breadth first
     * strategy for sub ModuleTrees.
     *
     * @yield {Module}
     */
    * eachModule() {
        for (const module of flatten(this)) {
            yield module;
        }
    }

    /**
     * Create a String representation of this ModuleTree.
     *
     * @return {String}
     */
    stringify() {
        return stringifyModuleTree(this);
    }
}

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
};

const conditionHolds = function (production, edge) {
    if (!production.isConditional()) {
        // No condition always holds
        return true;
    }

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
     * @param {ModuleTree} moduleTree - the moduleTree that is being expected
     * @param {Number} edgeIndex - the index of edge in the moduleTree
     * @param {Module[]} [ignore = []] - a list of modules to ignore when
     * looking at the context
     *
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
     * @param {Number[]|Boolean[]} [parameters = {}] - an optional map
     * of actual parameters to apply to this Expression before evaluating the
     * Expression.
     *
     * @return {Number|Boolean|undefined} the result of the evaluating this
     * Expression.
     */
    evaluate(parameters = {}) {
        const actualParameters = this.formalParameters.map((p) => parameters[p]);
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
// A Module's private properties
const _name$1 = new WeakMap();
const _parameters = new WeakMap();

/**
 * A Module represents a symbol in a LSystem.
 *
 * @property {String} name - the name of the module.
 * @property {Object[]} parameters - the parameters of this module.
 */
class Module {

    /**
     * Create a new Module
     *
     * @param {String} name - the module's name
     * @param {Object[]} [parameters = []] - the module's parameters, if any
     */
    constructor(name, parameters = []) {
        _name$1.set(this, name);
        _parameters.set(this, parameters);
    }

    get name() {
        return _name$1.get(this);
    }

    get parameters() {
        return _parameters.get(this);
    }

    /**
     * Is this Module equal to another module?
     *
     * @param {Module} other - the other module to compare this module with
     * @return {Boolean} True if the names are the same as well as their
     * number of parameters.
     */
    equals(other) {
        // console.log(`${this.name} === ${other.name} and ${this.parameters.length} === ${other.parameters.length}`);
        return this.name === other.name && this.parameters.length === other.parameters.length;
    }

    /**
     * Is this Module parameterized?
     *
     * @returns {Boolean} true if it has parameters.
     */
    isParameterized() {
        return 0 < this.parameters.length;
    }

    /**
     * Create a String representation of this Module.
     *
     * @returns {String}
     */
    stringify() {
        if (this.isParameterized()) {
            return `${this.name}(${this.parameters.map((p) => p.stringify()).join(",")})`;
        } else {
            return this.name;
        }
    }
}

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
const _values = new WeakMap();

/**
 * A ModuleValue defines an actual module in a string.
 *
 * @property {Number[]} values
 */
class ModuleValue extends Module {

    constructor(name, moduleDefinition, actualParameters) {
        const formalParameters = moduleDefinition.parameters;

        if (formalParameters.length !== actualParameters.length) {
            throw new Error(`Number of actual parameters (${actualParameters.length}) should be equal to the number of formal parameters (${formalParameters.length}).`);
        }

        super(name, formalParameters);

        const values = {};

        for (let index = 0; index < formalParameters.length; index++) {
            const name = formalParameters[index];
            const value = actualParameters[index];
            values[name] = value instanceof Expression ? value.evaluate() : value;
        }

        _values.set(this, values);
    }

    get values() {
        return _values.get(this);
    }

    /**
     * Get the value of a parameter.
     *
     * @param {String} name - the name of the parameter to get
     * @return {Number} the value of this parameter, or undefined if it does
     * not exist.
     */
    getValue(name) {
        return _values.get(this)[name];
    }

    /**
     * Create a String representation of this Module.
     *
     * @returns {String}
     */
    stringify() {
        if (this.isParameterized()) {
            return `${this.name}(${Object.values(_values.get(this)).join(',')})`;
        } else {
            return this.name;
        }
    }
}

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
        const values = this.parameters
            .reduce(
                (values, name) => {
                    values.push(this.getExpression(name).evaluate(parameters));
                    return values;
                }, []
            );
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
const applyParametersToModuleTree = function (moduleTree, parameters = {}) {
    const successor = new ModuleTree();
    for (const module of moduleTree) {
        if (module instanceof ModuleTree) {
            successor.push(applyParametersToModuleTree(module, parameters));
        } else {
            successor.push(module.apply(parameters));
        }
    }
    return successor;
};

/**
 * A successor in a production.
 *
 * @property {Module[]} a list of modules
 */
class Successor extends ModuleTree {
    /**
     * Apply parameters to this successor.
     * 
     * @param {Object[]} [parameters = {}] - the parameters to apply.
     *
     * @returns {Successor} This Successor with parameters applied, if any.
     */
    apply(parameters = {}) {
        return applyParametersToModuleTree(this, parameters);
    }
}

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
/**
 * An IdentityProduction is a Production that maps a Module to itself. This is
 * used in an LSystem for all Modules in an Alphabet that do not have a
 * Production of their own. This allows to use more succinct LSystem
 * definitions.
 */
class IdentityProduction extends Production {
    /**
     * Create a new IdentityProduction instance.
     *
     * @param {Module} module - the module for which to create the
     * IdentityProduction.
     */
    constructor(module) {
        const expressions = [];
        if (module.isParameterized()) {
            for (const name of module.parameters) {
                expressions.push(new NumericalExpression([name], name));
            }
        }
        const moduleApplication = new ModuleApplication(module.name, module, expressions);

        super(new Predecessor(moduleApplication), new Successor([moduleApplication]));
    }
}

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
// Token's private members
const _name$2 = new WeakMap();
const _lexeme = new WeakMap();
const _value = new WeakMap();
const _column$1 = new WeakMap();
const _line$1 = new WeakMap();
const _lexemeBegin$1 = new WeakMap();

/**
 * A token recognized during the lexical analysis of a LSystem input string
 * and used to parse that input string.
 *
 * @property {Symbol} name - this Token's type name, such as IDENTIFIER or
 * OPERATOR
 * @property {String} lexeme - this Token's lexeme
 * @property {String|Number|undefined} value - this Token's value as
 * recognized from the lexeme
 * @property {Number} line - the line number this Token was found at in the
 * input string
 * @property {Number} column - the column on the line this Token was found at
 * @property {Number} lexemeBegin - the index of the first character of this
 * Token's lexeme in the input string
 */
class Token {
    /**
     * Create a new Token.
     *
     * @param {Symbol} name - the name of the token type, such as IDENTIFIER or
     *   OPERATOR
     * @param {String} lexeme - the string that is recognized as this token
     * @param {String|Number|undefined} value - the value represented by the
     *   lexeme
     * @param {Number} line - the line in the input string this token was
     *   recognized
     * @param {Number} column - the column in the line in the input string this
     *   token was recognized
     * @param {Number} lexemeBegin - the index of the first character of the
     *   lexeme in the input string
     */
    constructor(name, lexeme, value, line, column, lexemeBegin) {
        _name$2.set(this, name);
        _lexeme.set(this, lexeme);
        _value.set(this, value);
        _line$1.set(this, line);
        _column$1.set(this, column);
        _lexemeBegin$1.set(this, lexemeBegin);
    }

    get name() {
        return _name$2.get(this);
    }
    
    get lexeme() {
        return _lexeme.get(this);
    }

    get value() {
        return _value.get(this);
    }

    get line() {
        return _line$1.get(this);
    }

    get column() {
        return _column$1.get(this);
    }

    get lexemeBegin() {
        return _lexemeBegin$1.get(this);
    }

    /**
     * Get the position of this Token in the input source in the format (line,
     * column).
     *
     * @returns {String}
     */
    position() {
        return `(${this.line}, ${this.column})`;
    }
}

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
// Token names

const NUMBER = Symbol("NUMBER");
const IDENTIFIER = Symbol("IDENTIFIER");
const BRACKET_OPEN = Symbol("BRACKET_OPEN");
const BRACKET_CLOSE = Symbol("BRACKET_CLOSE");
const OPERATOR = Symbol("OPERATOR");
const DELIMITER = Symbol("DELIMITER");
const KEYWORD = Symbol("KEYWORD");
const STRING = Symbol("STRING");

// Private data and functions for lexer

const _input = new WeakMap();
const _lexemeBegin = new WeakMap();
const _forward = new WeakMap();
const _line = new WeakMap();
const _column = new WeakMap();

const _context = new WeakMap();

// Manipulate state of DFA

const reset = function (lexer, input) {
    _input.set(lexer, input);
    _lexemeBegin.set(lexer, 0);
    _forward.set(lexer, -1);
    _line.set(lexer, 0);
    _column.set(lexer, 0);
    _context.set(lexer, undefined);
};

const saveState = function (lexer) {
    return {
        lexemeBegin: _lexemeBegin.get(lexer),
        forward: _forward.get(lexer),
        line: _line.get(lexer),
        column: _column.get(lexer)
    };
};

const restoreState = function (lexer, state) {
    _lexemeBegin.set(lexer, state.lexemeBegin);
    _forward.set(lexer, state.forward);
    _line.set(lexer, state.line);
    _column.set(lexer, state.column);
};

const setContext = function (lexer, newContext = undefined) {
    _context.set(lexer, newContext);
};

const isContext = function (lexer, context) {
    return _context.get(lexer) === context;
};

const line = function (lexer) {
    return _line.get(lexer);
};

const column = function (lexer) {
    return _column.get(lexer);
};

const peek = function (lexer, distance = 1) {
    const forward = _forward.get(lexer);
    if (forward + distance < _input.get(lexer).length) {
        return _input.get(lexer)[forward + distance];
    }
};

const moveForward = function (lexer, skip = false) {
    const c = peek(lexer);
    if (c) {
        _forward.set(lexer, _forward.get(lexer) + 1);
        if ("\n" === c) {
            _line.set(lexer, line(lexer) + 1);
            _column.set(lexer, 0);
        } else {
            _column.set(lexer, column(lexer) + 1);
        }

        if (skip) {
            _lexemeBegin.set(lexer, _lexemeBegin.get(lexer) + 1);
        }
    }
};

const lexeme = function (lexer) {
    const start = _lexemeBegin.get(lexer);
    const end = _forward.get(lexer);
    return _input.get(lexer).slice(start, end + 1);
};

const recognize  = function (lexer, tokenName, value, l = line(lexer), c = column(lexer) - lexeme(lexer).length) {
    const token = new Token(
        tokenName, 
        lexeme(lexer), 
        value, 
        l, 
        c,
        _lexemeBegin.get(this)
    );

    _lexemeBegin.set(lexer, _forward.get(lexer) + 1);
    _forward.set(lexer, _forward.get(lexer));

    return token;
};

const position = function (lexer) {
    return `(${line(lexer)}, ${column(lexer) - (_forward.get(lexer) - _lexemeBegin.get(lexer))})`;
};

// Recognize patterns

const isWhitespace = function (c) {
    return [" ", "\t", "\n"].includes(c);
};

const isCommentStart = function (c) {
    return "#" === c;
};

const isDigit = function (c) {
    return "0" <= c && c <= "9";
};

const isLetter = function (c) {
    return ("a" <= c && c <= "z") || ("A" <= c && c <= "Z");
};

const isIdentifierExtra = function (c) {
    return [
        "'",
        "_"
    ].includes(c);
};

const isKeyword = function (identifier) {
    return [
        "lsystem",
        "alphabet",
        "axiom",
        "productions",
        "ignore",
        "include",
        "and",
        "or",
        "not",
        "true",
        "false",
        "description"
    ].includes(identifier);
};

const isIdentifierSymbol = function (c) {
    return [
        "+",
        "-",
        "/",
        "*",
        "&",
        "|",
        "$"
    ].includes(c);
};

// Recognize Tokens

const string = function (lexer, delimiter = "\"") {
    if (delimiter === peek(lexer)) {
        const lineStart = line(lexer);
        const colStart = column(lexer);

        moveForward(lexer);
        while (delimiter !== peek(lexer)) {
            moveForward(lexer);
        }
        moveForward(lexer);

        return recognize(
            lexer, 
            STRING, 
            lexeme(lexer).slice(1, -1), 
            lineStart, 
            colStart
        );
    }
};

const skipWhitespace = function (lexer) {
    while (isWhitespace(peek(lexer))) {
        moveForward(lexer, true);
    }
};

const skipComment = function (lexer) {
    if (isCommentStart(peek(lexer))) {
        while ("\n" !== peek(lexer)) {
            moveForward(lexer, true);
        }
    }
};

const digits = function (lexer) {
    while(isDigit(peek(lexer))) {
        moveForward(lexer);
    }
};

const integer = function (lexer) {
    if (isDigit(peek(lexer))) {
        moveForward(lexer);
        digits(lexer);
    }
};

const number = function (lexer) {
    if (isDigit(peek(lexer))) {
        integer(lexer);

        // Decimal part
        if ("." === peek(lexer) && isDigit(peek(lexer, 2))) {
            moveForward(lexer);
            digits(lexer);
        }

        // Exponent part
        if (["e", "E"].includes(peek(lexer))) {
            moveForward(lexer);

            if (["+", "-"].includes(peek(lexer))) {
                moveForward(lexer);
            }

            if (!isDigit(peek(lexer))) {
                throw new LexicalError(`Expected a numerical exponential part at ${position(lexer)}, got "${peek(lexer)}" instead.`);
            }

            digits(lexer);
        }

        try {
            const value = parseFloat(lexeme(lexer));
            return recognize(lexer, NUMBER, value);        
        } catch (e) {
            throw new LexicalError(`Unable to parse "${lexeme(lexer)}" as a number at ${position(lexer)}.`);
        }
    }
};

const identifier = function (lexer) {
    // Modules can have symbols such as '+' or '-' as name as well.
    if (isContext(lexer, MODULE_NAME) && isIdentifierSymbol(peek(lexer))) {
        moveForward(lexer);
        return recognize(lexer, IDENTIFIER, lexeme(lexer));
    }

    if (isLetter(peek(lexer))) {
        moveForward(lexer);
        while (isLetter(peek(lexer)) || isDigit(peek(lexer)) || isIdentifierExtra(peek(lexer))) {
            moveForward(lexer);
        }

        const id = lexeme(lexer);

        return isKeyword(id) ? 
            recognize(lexer, KEYWORD, id) : 
            recognize(lexer, IDENTIFIER, id);
    }
};


const bracket = function (lexer) {
    const BRACKET_OPEN_CHARACTERS = ["(", "{", "["];
    const BRACKET_CLOSE_CHARACTERS = [")", "}", "]"];

    if (isContext(lexer, CONTEXT)) {
        BRACKET_OPEN_CHARACTERS.push("<");
        BRACKET_CLOSE_CHARACTERS.push(">");
    }

    const c = peek(lexer);
    if (BRACKET_OPEN_CHARACTERS.includes(c)) {
        moveForward(lexer);
        return recognize(lexer, BRACKET_OPEN, c);
    } else if (BRACKET_CLOSE_CHARACTERS.includes(c)) {
        moveForward(lexer);
        return recognize(lexer, BRACKET_CLOSE, c);
    }
};

const delimiter = function (lexer) {
    const c = peek(lexer);
    if ([",", ":", ";"].includes(c)) {
        moveForward(lexer);
        return recognize(lexer, DELIMITER, c);
    }
};

const operator = function (lexer) {
    const c = peek(lexer);
    if (["-", "+", "*", "/", "^", ">", "<", "="].includes(c)) {
        if ("-" === c) {
            moveForward(lexer);
            if (">" === peek(lexer)) {
                moveForward(lexer);
            }
        } else if ("<" === c) {
            moveForward(lexer);
            if ("=" === peek(lexer) || ">" === peek(lexer)) {
                moveForward(lexer);
            }
        } else if (">" === c) {
            moveForward(lexer);
            if ("=" === peek(lexer)) {
                moveForward(lexer);
            }
        } else {
            moveForward(lexer);
        }

        return recognize(lexer, OPERATOR, lexeme(lexer));
    }
};


/**
 * A Lexer to analyse LSystem input strings lexically.
 */
class Lexer {

    /**
     * Create a new Lexer for an LSystem input string
     *
     * @param {String} [input = ''] - the input string the analyse.
     */
    constructor(input = "") {
        reset(this, input);
    }

    /**
     * Get the next token in the input. The token to regognize can depend on
     * the context.
     *
     * @param {Symbol} [context = undefined] - an optional context to control
     * the recognition process. For example, symbols like '+' and '-' are
     * operators in the context of an expression, but are identifiers in the
     * context of an alphabet.
     *
     * @returns {Token|undefined} the recognized token or undefined if no
     * token could be recognized.
     */
    getNextToken(context = undefined) {
        setContext(this, context);
        while (peek(this)) {
            do {
                skipWhitespace(this);
                skipComment(this);
            } while (
                isWhitespace(peek(this)) || isCommentStart(peek(this))
            );

            const token =
                identifier(this) ||
                number(this) ||
                bracket(this) ||
                delimiter(this) ||
                operator(this) ||
                string(this);

            if (token) {
                return token;
            }
        }
    }

    /**
     * Look a distance ahead in the input string, optionally take into account
     * the context.
     *
     * @param {Number} [distance = 1] - the distance to look ahead, defaults to
     * 1.
     * @param {Symbol} [context = undefined] - an optional context to control
     * the recognition process.
     *
     * @returns {Token|undefined} the token recognized at distance or
     * undefined if no token could be recognized at that distance.
     */
    lookAhead(distance = 1, context = undefined) {
        const state = saveState(this);
        let token = undefined;
        for (let i = 0; i < distance; i++) {
            token = this.getNextToken(context);
        }
        restoreState(this, state);
        return token;
    }

}

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
/**
 * A ModuleDefinition defines a module in an alphabet.
 */
class ModuleDefinition extends Module {

    /**
     * Does an actual module matches this Module's definition?
     *
     * @param {Module} actualModule - the actual module to check against this
     * Module definition
     * @returns {Boolean} True if the number of parameters is the same in
     * actual and definition.
     */
    matchesDefinition(actualModule) {
        return this.parameters.length === actualModule.parameters.length;
    }

    /**
     * Create a String representation of this Module.
     *
     * @returns {String}
     */
    stringify() {
        if (this.isParameterized()) {
            return `${this.name}(${this.parameters.join(",")})`;
        } else {
            return this.name;
        }
    }
}

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
const _moduleDefinitions = new WeakMap();

/**
 * The Alphabet of an LSystem. The modules in an Alphabet are unique.
 *
 * @property {ModuleDefinition[]} moduleDefinitions
 */
class Alphabet {

    /**
     * Create a new instance of Alphabet.
     *
     * @param {Module[]} modules - a list of modules. 
     */
    constructor(modules) {
        _moduleDefinitions.set(this, []);
        for (const module of modules) {
            this.add(module);
        }
    }

    get moduleDefinitions() {
        return _moduleDefinitions.get(this);
    }

    /**
     * Add a module to this Alphabet. If it already contains this module, an
     * error is thrown.
     *
     * @param {Module} module - the module to add
     * @throws {Error}
     */
    add(module) {
        if (this.has(module)) {
            throw new Error(`This alphabet already has a module '${module.stringify()}'.`);
        }
        _moduleDefinitions.get(this).push(module);
    }

    /**
     * Does this Alphabet have this module?
     *
     * @param {Module} module
     * @returns {Boolean} True if this Alphabet contains this module.
     */
    has(module) {
        return undefined !== this.get(module);
    }

    /**
     * Get a module from this Alphabet.
     *
     * @param {Module} module
     * @returns {Module|undefined} the module
     */
    get(module) {
        const found = _moduleDefinitions
            .get(this)
            .filter(
                (m) => 
                    m.name === module.name && 
                    m.parameters.every((p) => p in module.parameters)
            );
        return 1 === found.length ? found[0] : undefined;
    }

    /**
     * Create a String representation of this Alphabet.
     *
     * @returns {String}
     */
    stringify() {
        return _moduleDefinitions.get(this).map((m) => m.stringify()).join(", ");
    }

}

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
const _successorList = new WeakMap();


const setupProbabilityMapping = function (production, successorList) {
    let lower = 0;
    for (const successor of successorList) {
        if (0 >= successor.probability || successor.probability > 1) {
            throw new Error('Probability should be between 0 and 1');
        }

        successor.lower = lower;
        successor.upper = successor.lower + successor.probability;
        lower = successor.upper;
    }

    if (1 !== successorList.reduce((sum, pair) => sum += pair.probability, 0)) {
        throw new Error('Total probability should be 1');
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
const _lexer = new WeakMap();
const _idTable = new WeakMap();

// Scopes
const MODULE = Symbol("MODULE");
const GLOBAL = Symbol("GLOBAL");

// Contexts
const CONTEXT = Symbol("CONTEXT");
const MODULE_NAME = Symbol("MODULE_NAME");

const defined = function (parser, name, scope = MODULE) {
    const idTable = _idTable.get(parser);
    return idTable.find((id) => id.name === name && id.scope === scope);
};

const installIdentifier = function (parser, identifierToken, scope = MODULE) {
    const idTable = _idTable.get(parser);
    const name = identifierToken.value;
    if (!defined(parser, name, scope)) {
        idTable.push({name, scope});
    } else {
        throw new ParseError(`'${name}' at ${identifierToken.position()} is already defined.`);
    }
};

const installModuleDefinition = function (parser, moduleDefinition) {
    const identifier = defined(parser, moduleDefinition.name);
    identifier.moduleDefinition = moduleDefinition;
};

const lookAhead = function (parser, name, value = undefined, distance = 1, context = undefined) {
    const token = _lexer.get(parser).lookAhead(distance, context);
    return token.name === name && (undefined !== value ? token.value === value : true);
};

const match = function (parser, name, value = undefined, context = undefined) {
    const token = _lexer.get(parser).getNextToken(context);
    if (token.name === name && (undefined !== value ? token.value === value : true)) {
        return token;
    } else {
        throw new ParseError(`expected ${name.toString()}${undefined !== value ? " with value '" + value + "'": ""} at ${token.position()}`);
    }
};

const parseList = function (parser, recognizeFunction, closingBracket = ")") {
    if (lookAhead(parser, BRACKET_CLOSE, closingBracket)) {
        return [];
    } else {
        const item = recognizeFunction.call(undefined, parser);
        const list = [item];
        if (lookAhead(parser, DELIMITER, ",")) {
            match(parser, DELIMITER, ",");
            return list.concat(parseList(parser, recognizeFunction));
        } else {
            return list;
        }
    }
};

const parseDescription = function (parser) {
    match(parser, KEYWORD, "description");
    match(parser, DELIMITER, ":");
    return match(parser, STRING).value;
};

const parseFormalParameter = function (parser) {
    return match(parser, IDENTIFIER).value;
};

const parseModuleDefinition = function (parser) {
    const moduleNameToken = match(parser, IDENTIFIER, undefined, MODULE_NAME);
    const moduleName = moduleNameToken.value;
    installIdentifier(parser, moduleNameToken, MODULE);

    let formalParameters = [];

    if (lookAhead(parser, BRACKET_OPEN, "(")) {
        match(parser, BRACKET_OPEN, "(");
        if (lookAhead(parser, IDENTIFIER)) {
            formalParameters = parseList(parser, parseFormalParameter);
        }
        match(parser, BRACKET_CLOSE, ")");
    }

    const moduleDefinition = new ModuleDefinition(moduleName, formalParameters);
    installModuleDefinition(parser, moduleDefinition);
    return moduleDefinition;
};

const parseAlphabet = function (parser) {
    match(parser, KEYWORD, "alphabet");
    match(parser, DELIMITER, ":");
    match(parser, BRACKET_OPEN, "{");
    const alphabet = new Alphabet(parseList(parser, parseModuleDefinition, "}"));
    match(parser, BRACKET_CLOSE, "}");
    return alphabet;
};

const parseNumExprUnit = function (parser) {
    let numExpr = "";
    let variables = [];
    if (lookAhead(parser, IDENTIFIER)) {
        const variable = match(parser, IDENTIFIER).value;
        numExpr = variable;
        variables = [variable];
    } else if (lookAhead(parser, NUMBER)) {
        numExpr = match(parser, NUMBER).value.toString();
    } else if (lookAhead(parser, OPERATOR, "-")) {
        match(parser, OPERATOR, "-");
        const [expr, vars] = parseNumExprUnit(parser);
        numExpr = `- ${expr}`;
        variables = variables.concat(vars);
    } else if (lookAhead(parser, BRACKET_OPEN, "(")) {
        match(parser, BRACKET_OPEN, "(");
        const [expr, vars] = parseNumExpr(parser);
        match(parser, BRACKET_CLOSE, ")");
        numExpr = `(${expr})`;
        variables = variables.concat(vars);
    }
    return [numExpr, variables];
};

const parseNumFactor = function (parser) {
    let [expr, vars] = parseNumExprUnit(parser);
    if (lookAhead(parser, OPERATOR, "^")) {
        match(parser, OPERATOR);
        const [subExpr, subVars] = parseNumFactor(parser);
        expr += ` ** ${subExpr}`;
        vars = vars.concat(subVars);
    }
    return [expr, vars];
};

const parseNumTerm = function (parser) {
    let [expr, vars] = parseNumFactor(parser);
    if (
        lookAhead(parser, OPERATOR, "*") ||
        lookAhead(parser, OPERATOR, "/")
    ) {
        const op = match(parser, OPERATOR).value;
        const [subExpr, subVars] = parseNumFactor(parser);
        expr += ` ${op} ${subExpr}`;
        vars = vars.concat(subVars);
    }

    return [expr, vars];
};

const parseNumExpr = function (parser) {
    let [expr, vars] = parseNumTerm(parser);
    if (
        lookAhead(parser, OPERATOR, "+") ||
        lookAhead(parser, OPERATOR, "-")
    ) {
        const op = match(parser, OPERATOR).value;
        const [subExpr, subVars] = parseNumTerm(parser);
        expr += ` ${op} ${subExpr}`;
        vars = vars.concat(subVars);
    }

    return [expr, vars];
};

const parseCompExpr = function (parser) {
    const [leftExpr, leftVars] = parseNumExpr(parser);
    
    let op = match(parser, OPERATOR).value;
    if (op === "=") {
        op = "===";
    } else if (op === "!=") {
        op = "!==";
    }
        
    const [rightExpr, rightVars] = parseNumExpr(parser);
    
    return [
        `${leftExpr} ${op} ${rightExpr}`,
        leftVars.concat(rightVars)
    ];
};

const parseBoolExprUnit = function (parser) {
    let boolExpr = "";
    let variables = [];

    if (
        lookAhead(parser, KEYWORD, "true") ||
        lookAhead(parser, KEYWORD, "false")
    ) {
        boolExpr = match(parser, KEYWORD).value;
    } else if (lookAhead(parser, KEYWORD, "not")) {
        match(parser, KEYWORD);
        const [expr, vars] = parseBoolExpr(parser);
        boolExpr = `!${expr}`;
        variables = variables.concat(vars);
    } else if (lookAhead(parser, BRACKET_OPEN, "(")) {
        match(parser, BRACKET_OPEN, "(");
        const [expr, vars] = parseBoolExpr(parser);
        boolExpr = `(${expr})`;
        variables = variables.concat(vars);
        match(parser, BRACKET_CLOSE, ")");
    } else {
        const [expr, vars]  = parseCompExpr(parser);
        boolExpr = expr;
        variables = variables.concat(vars);
    }
     
    return [boolExpr, variables];   
};

const parseBoolFactor = function (parser) {
    return parseBoolExprUnit(parser);
};

const parseBoolTerm = function (parser) {
    let [expr, vars] = parseBoolFactor(parser);
    if (lookAhead(parser, KEYWORD, "and")) {
        match(parser, KEYWORD);
        const [subExpr, subVars] = parseBoolFactor(parser);
        expr += ` && ${subExpr}`;
        vars = vars.concat(subVars);
    }
    return [expr, vars];
};

const parseBoolExpr = function (parser) {
    let [expr, vars] = parseBoolTerm(parser);
    if (lookAhead(parser, KEYWORD, "or")) {
        match(parser, KEYWORD);
        const [subExpr, subVars] = parseBoolTerm(parser);
        expr += ` || ${subExpr}`;
        vars = vars.concat(subVars);
    }
    return [expr, vars];
};

const parseActualParameter = function (parser) {
    const [expr, vars] = parseNumExpr(parser);
    return new NumericalExpression(vars, expr);
};

const parseActualModule = function (parser, ModuleClass) {
    const moduleNameToken = match(parser, IDENTIFIER, undefined, MODULE_NAME);
    const moduleName = moduleNameToken.value;

    const module = defined(parser, moduleName, MODULE);

    if (undefined === module) {
        throw new ParseError(`Module '${moduleName}' at position ${moduleNameToken.position()} not in the alphabet.`);
    }

    let actualParameters = [];
   
    if (lookAhead(parser, BRACKET_OPEN, "(")) {
        match(parser, BRACKET_OPEN, "(");
        actualParameters = parseList(parser, parseActualParameter);
        match(parser, BRACKET_CLOSE, ")");
    }

    return new ModuleClass(moduleName, module.moduleDefinition, actualParameters);
};

const parseModuleApplication = function (parser) {
    return parseActualModule(parser, ModuleApplication);
};

const parseModuleTree = function (parser, ModuleClass, withSubTrees = true) {
    const moduleTree = new ModuleTree();

    while (
        !lookAhead(parser, OPERATOR, "->") && (
            lookAhead(parser, IDENTIFIER, undefined, 1, MODULE_NAME) || 
            lookAhead(parser, BRACKET_OPEN, "[")
        )
    ) {
        if (withSubTrees && lookAhead(parser, BRACKET_OPEN, "[")) {
            // Match a sub tree
            match(parser, BRACKET_OPEN, "[");
            moduleTree.push(parseModuleTree(parser));
            match(parser, BRACKET_CLOSE, "]");
        } else {
            // Match a module in the moduleTree
            moduleTree.push(parseActualModule(parser, ModuleClass));
        }
    }

    return moduleTree;
};

const parseModuleValueTree = function (parser, withSubTrees = true) {
    return parseModuleTree(parser, ModuleValue, withSubTrees);
};

const parseModuleApplicationTree = function (parser, withSubTrees = true) {
    return parseModuleTree(parser, ModuleApplication, withSubTrees);
};


const parseSuccessor = function (parser) {
    const successor = new Successor();

    while (
        lookAhead(parser, IDENTIFIER, undefined, 1, MODULE_NAME) || 
        lookAhead(parser, BRACKET_OPEN, "[")
    ) {
        if (lookAhead(parser, BRACKET_OPEN, "[")) {
            // Match a sub tree
            match(parser, BRACKET_OPEN, "[");
            successor.push(parseSuccessor(parser));
            match(parser, BRACKET_CLOSE, "]");
        } else {
            // Match a module in the successor
            const module = parseModuleApplication(parser);
            successor.push(module);
        }
    }

    return successor;
};

const parseAxiom = function (parser) {
    match(parser, KEYWORD, "axiom");
    match(parser, DELIMITER, ":");
    return parseModuleValueTree(parser);
};


const parseStochasticSuccessorList = function (parser) {
    const stochasticSuccessorList = [];
    match(parser, BRACKET_OPEN, "{");
    while (lookAhead(parser, NUMBER)) {
        const probability = match(parser, NUMBER).value;
        match(parser, OPERATOR, "->");
        const successor = parseSuccessor(parser);
        stochasticSuccessorList.push({probability, successor});
        if (lookAhead(parser, DELIMITER, ",")) {
            match(parser, DELIMITER, ",");
        }
    }
    match(parser, BRACKET_CLOSE, "}");

    // The propabilities should add up to 1.0 exactly.
    const totalProbability = stochasticSuccessorList.reduce((sum, ps) => {
        return sum + ps.probability;
    }, 0);

    if (totalProbability !== 1) {
        throw new ParseError(`The probabilities of one module should add up to 1 exact, it adds up to ${totalProbability} instead.`);
    }

    return stochasticSuccessorList;
};

const parsePredecessor = function (parser) {
    const modules = [];
    let hasLeftContext = false;

    modules.push(parseModuleApplicationTree(parser, false));
    
    if (lookAhead(parser, BRACKET_OPEN, "<", 1, CONTEXT)) {
        match(parser, BRACKET_OPEN, "<", CONTEXT);
        modules.push(parseModuleApplication(parser));
        hasLeftContext = true;
    }
    
    if (lookAhead(parser, BRACKET_CLOSE, ">", 1, CONTEXT)) {
        match(parser, BRACKET_CLOSE, ">", CONTEXT);
        modules.push(parseModuleApplicationTree(parser));
    }

    let predecessor = undefined;

    if (1 === modules.length) {
        predecessor = new Predecessor(modules[0][0]);
    } else if (2 === modules.length) {
        if (hasLeftContext) {
            predecessor = new Predecessor(modules[1]);
            predecessor.leftContext = modules[0];
        } else {
            predecessor = new Predecessor(modules[0][0]);
            predecessor.rightContext = modules[1];
        }
    } else {
        predecessor = new Predecessor(modules[1]);
        predecessor.leftContext = modules[0];
        predecessor.rightContext = modules[2];
    }

    return predecessor;
};

const parseProduction = function (parser) {
    let production = undefined;
    const predecessor = parsePredecessor(parser);
    let successor = undefined;
    let condition = undefined;
    
    if (lookAhead(parser, DELIMITER, ":")) {
        match(parser, DELIMITER, ":");
        if (!lookAhead(parser, BRACKET_OPEN, "{")) {
            const [expr, vars] = parseBoolExpr(parser);
            condition = new BooleanExpression(vars, expr);
        }
    }
    
    if (lookAhead(parser, BRACKET_OPEN, "{")) {
        successor = parseStochasticSuccessorList(parser);
        production = new StochasticProduction(predecessor, successor, condition);
    } else if (lookAhead(parser, OPERATOR, "->")) {
        match(parser, OPERATOR, "->");
        successor = parseSuccessor(parser);
        production = new Production(predecessor, successor, condition);
    }

    return production;
};

const parseProductions = function (parser) {
    match(parser, KEYWORD, "productions");
    match(parser, DELIMITER, ":");
    match(parser, BRACKET_OPEN, "{");
    const productions = parseList(parser, parseProduction, "}");
    match(parser, BRACKET_CLOSE, "}");
    return productions;
};

const parseIgnore = function (parser) {
    match(parser, KEYWORD, "ignore");
    match(parser, DELIMITER, ":");
    match(parser, BRACKET_OPEN, "{");
    const ignoreList = parseList(parser, parseModuleApplication, "}");
    match(parser, BRACKET_CLOSE, "}");
    return ignoreList;
};

const parseLSystem = function (parser) {
    let name = "";
    if (lookAhead(parser, IDENTIFIER)) {
        name = match(parser, IDENTIFIER).value;
        match(parser, OPERATOR, "=");
    }

    match(parser, KEYWORD, "lsystem");
    match(parser, BRACKET_OPEN, "(");

    let description = "";
    if (lookAhead(parser, KEYWORD, "description")) {
        description = parseDescription(parser);
        match(parser, DELIMITER, ",");
    }

    const alphabet = parseAlphabet(parser);
    match(parser, DELIMITER, ",");
    const axiom = parseAxiom(parser);
    match(parser, DELIMITER, ",");
    const productions = parseProductions(parser);
    let ignore = [];
    if (lookAhead(parser, DELIMITER, ",")) {
        match(parser, DELIMITER, ",");
        ignore = parseIgnore(parser);
    }
    match(parser, BRACKET_CLOSE, ")");

    const lsystem = new LSystem(name, description, alphabet, axiom, productions, ignore);
    
    return lsystem;
};

const parseConstant = function (parser) {
    const constantNameToken = match(parser, IDENTIFIER);
    const name = constantNameToken.value;

    installIdentifier(parser, constantNameToken, GLOBAL);
    match(parser, OPERATOR, "=");
    const value = parseActualParameter(parser);
    match(parser, DELIMITER, ";");
    
    return {name, value};
};

const parse = function (parser) {
    // Imports
    // ToDo

    const globalContext = {};
    // Constants
    while (lookAhead(parser, IDENTIFIER) && !lookAhead(parser, KEYWORD, "lsystem", 3)) {
        const constant = parseConstant(parser);
        globalContext[constant.name] = constant.value;
    }

    // LSystem
    const lsystem = parseLSystem(parser);
    lsystem.globalContext = globalContext;

    return lsystem;
};

/**
 * Parser for LSystem input strings
 */
class Parser {

    /**
     * Create a new Parser
     */
    constructor() {
    }

    /**
     * Parse a LSYSTEM definition input string
     *
     * @param {String} input - the input string to parse
     *
     * @returns {{LSystem, Object}} An object containing the LSystem and a
     * global constants used in that LSystem, if any.
     */
    parse(input) {
        _lexer.set(this, new Lexer(input));
        _idTable.set(this, []);
        return parse(this);
    }
}

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
const _name = new WeakMap();
const _description = new WeakMap();
const _alphabet = new WeakMap();
const _axiom = new WeakMap();
const _productions = new WeakMap();
const _ignore = new WeakMap();
const _globalContext = new WeakMap();

const _currentDerivation = new WeakMap();
const _derivationLength = new WeakMap();

const ignore = function (lsystem, edge) {
    return 0 < lsystem.ignore.filter(m => m.equals(edge)).length;
};

const actualGlobalContext = function (lsystem) {
    const actualContext = {};

    Object.entries(lsystem.globalContext).forEach((keyValue) => {
        const [name, valueExpr] = keyValue;
        actualContext[name] = valueExpr.evaluate(actualContext);
    });

    return actualContext;
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

        const contextSensitive = productions.filter(p => p.predecessor.isContextSensitive());

        if (0 < contextSensitive.length) {
            return contextSensitive[0];
        } else {
            return productions[0];
        }
    }
};

const findProduction = function (lsystem, module, moduleTree, pathTaken, edgeIndex) {
    const candidates = lsystem
        .productions
        .filter((p) => p.matches(module, moduleTree, pathTaken, edgeIndex, lsystem.ignore, actualGlobalContext(lsystem)));

    if (0 < candidates.length) {
        return selectBestProduction(lsystem, candidates);
    } else {
        // Modules that do not match any production are copied to the
        // successor directly. This is also known as the 'identity' production
        // rule.
        return new IdentityProduction(module);
    }
};

const derive = function(lsystem, moduleTree, pathTaken = [], edgeIndex = 0) {
    const successor = new ModuleTree();

    while (edgeIndex < moduleTree.length) {
        const edge = moduleTree[edgeIndex];
        if (edge instanceof ModuleTree) {
            successor.push(derive(lsystem, edge, pathTaken, 0));
        } else {
            const production = findProduction(lsystem, edge, moduleTree, pathTaken, edgeIndex);
            const rewrittenNode = production.follow(edge, actualGlobalContext(lsystem));

            //console.log(edgeIndex, production.stringify());

            for (const successorNode of rewrittenNode) {
                successor.push(successorNode);
            }

            // Add node to the path taken if it should not be ignored in the
            // context.
            if (!ignore(lsystem, edge)) {
                pathTaken.push(edge);
            }
        }

        edgeIndex++;
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
 * @property {Object{ globalContext - the global context in which this lsystem
 * exists. Used for constants and references to other lsystems.
 *
 * @property {String} name - this LSystem's name
 * @property {String} description - this LSystem's description
 */
const LSystem = class {
    /**
     * Create a new instance of LSystem.
     *
     * @param {String} name
     * @param {String} description
     * @param {Alphabet} alphabet
     * @param {ModuleTree} axiom
     * @param {Production[]} productions
     * @param {Module[]} ignore
     */
    constructor(name, description, alphabet, axiom, productions, ignore = []) {
        _globalContext.set(this, {});
        _name.set(this, name);
        _description.set(this, description);
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

    get name() {
        return _name.get(this) || "";
    }

    set name(newName) {
        _name.set(this, newName);
    }
    
    /**
     * Does this LSystem have a name?
     *
     * @returns {Boolesn} this LSystem has a non-empty name
     */
    hasName() {
        return 0 < this.name.length;
    }

    get description() {
        return _description.get(this) || "";
    }

    set description(newDescription) {
        _description.set(this, newDescription);
    }

    /**
     * Does this LSystem have a description?
     *
     * @returns {Boolean} this LSystem has a non-empty description
     */
    hasDescription() {
        return 0 < this.description.length;
    }

    get globalContext() {
        return _globalContext.get(this);
    }

    set globalContext(context) {
        _globalContext.set(this, context);
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
        let lsystem = "";

        // Serialize the global context, if any.
        let constants = Object.keys(this.globalContext).map(key => `${key} = ${this.globalContext[key].stringify()}`).join(";\n");
        if (constants.length > 0) {
            constants += ";\n\n";
        }

        lsystem += constants;
        
        // Serialize the LSystem definition
        if (this.hasName()) {
            lsystem += `${this.name} = `;
        }

        lsystem += "lsystem(";
        if (this.hasDescription()) {
            lsystem += `description: "${this.description}", `;
        }
            
        lsystem += `alphabet: {${this.alphabet.stringify()}}, axiom: ${this.axiom.stringify()}, productions: {${this.productions.map((p) => p.stringify()).join(", ")}}`;

        if (0 < this.ignore.length) {
            lsystem += `, ignore: {${this.ignore.map(m => m.stringify()).join(", ")}}`;
        }
        lsystem += ")";
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
            //console.log("predecessor: ", _currentDerivation.get(this).stringify());
            const predecessor = _currentDerivation.get(this);
            _currentDerivation.set(this, derive(this, predecessor));
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

const _function = new WeakMap();

class Command {
    constructor(...args) {
        let func;

        if (0 >= args.length) {
            // create an empty function; does do nothing
            func = function () {};
        } else if (1 === args.length) {
            // create with a function or a constant
            if ("function" === typeof args[0]) {
                func = args[0];
            } else {
                func = function () { return args[0]; };
            }
        } else if (2 === args.length) {
            // create with formal parameters and a function body in a string
            func = new Function(args[0], args[1]);
        } else {
            // ?
            throw new Error(`Expected at most 2 arguments, got ${args.length} instead.`);
        }

        _function.set(this, func);
    }

    /**
     * Execute this Command in this interpretation given the supplier
     * parameters
     *
     * @param {Interpretation} interpretation - the interpretation in which this command is executed
     * @param {Array} [parameters = []] - the parameters used in this Commmand
     */
    execute(interpretation, ...parameters) {
        _function.get(this).apply(interpretation, parameters);
    }

    toString() {
        return _function.get(this).toString().split("\n").slice(1, -1).map(l => l.trim()).join("\n");
    }
}

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
const property = function (name, type, defaultValue, convert) {
    return {
        "name": name,
        "type": type,
        "default": defaultValue,
        "converter": convert
    };
};

const number$1 = function (name, defaultValue = 0) {
    return property(name, "text", defaultValue, (n) => parseFloat(n));
};

const bool = function (name, defaultValue = false) {
    return property(name, "text", defaultValue, (b) => "true" === b ? true : false);
};

const string$1 = function (name, defaultValue = "") {
    return property(name, "text", defaultValue, (s) => s);
};

const color = function (name, defaultValue = "black") {
    return property(name, "color", defaultValue, (s) => s);
};

const _commands = new WeakMap();
const _initialState = new WeakMap();
const _states = new WeakMap();
const _registeredProperties = new WeakMap();

const renderTree = function (interpretation, moduleTree) {
    for (const item of moduleTree) {
        if (Array.isArray(item)) {
            interpretation.enter();
            renderTree(interpretation, item);
            interpretation.exit();
        } else {
            interpretation.execute(item.name, Object.values(item.values));
        }
    }
};

/**
 * An Interpretation of a LSystem
 *
 * @property {Object} state - the current state of this Interpretation.
 * @property {Object} registeredProperties - the properties that are
 * registered in this Interpretation.
 * @property {Object} properties - the properties that have been set in this
 * Interpretation
 * @property {Object} commands - the commands that have been defined in this
 * Interpretation.
 */
class Interpretation {
    /**
     * Create a new instance of an LSystem Interpretation.
     * 
     * @param {RenderingContext|SVGElement} canvas - the canvas to draw on.
     * @param {Object} scope - the scope of this Interpretation.
     */
    constructor(initialState = {}) {
        _initialState.set(this, initialState);
        _states.set(this, []);
        _commands.set(this, {});
        _registeredProperties.set(this, []);

        this.registerProperty(
            bool("animate"),
            number$1("derivationLength")
        );
    }

    get state() {
        const states = _states.get(this);
        if (0 === states.length) {
            this.initialize();
        }

        return states[states.length - 1];
    }

    get registeredProperties() {
        return _registeredProperties.get(this);
    }

    get properties() {
        return this.state();
    }

    get commands() {
        return _commands.get(this);
    }

    /**
     * A command function has the following signature:
     *
     * @callback commandFunction
     * @param {Number[]} [parameters = []] - a list of numerical parameters
     * you can use in the command;
     */

    /**
     * Execute a command with given parameters in the context of this
     * Interpretation.
     *
     * @param {String} name - the name of the command to execute.
     * @param {Array} [parameters = []] - an optional list of actual
     * parameters to apply when the command is executed.
     */
    execute(name, parameters = []) {
        const command = this.commands[name];

        if (undefined === command) {
            // By default commands that are unknown are ignored, only those
            // that need interpretation should be added to the interpretation.
            return;
        }

        if ("string" === typeof command) {
            this.execute(command, parameters);
        } else if (command instanceof Command) {
            command.execute(this, parameters);
        } else {
            // By default commands that are unknown are ignored, only those
            // that need interpretation should be added to the interpretation.
            return;
        }
    }

    /**
     * Register a number of properties for this interpretation. These
     * registered properties are applied on initialisation and when
     * entering/leaving a sub tree.
     *
     * @param {String} names - the names of the properties to register
     */
    registerProperty(...properties) {
        properties.forEach(p => {
            this.registeredProperties.push(p);
        });
    }

    /**
     * Get a registered property by name
     *
     * @param {String} name  - the name of the registered property to get.
     * @returns {Object}
     */
    getRegisteredProperty(name) {
        return this.registeredProperties.find((p) => name === p.name);
    }

    /**
     * Set a property of this Interpretation.
     *
     * @param {String} name - the name of the property.
     * @param {Object} value - the new value of the property.
     */
    setProperty(name, value) {
        this.state[name] = value;
    }
    
    /**
     * Get a property of this Interpretation. If no such property exists, or
     * if its value is undefined or null, return the defaultValue.
     *
     * @param {String} name - the name of the property.
     * @param {defaultValue} [defaultValue = 0] - the default value of this
     * property if no such property exists or its value is undefined or null.
     *
     * @returns {Object} the value of the property.
     */
    getProperty(name, defaultValue = 0) {
        const value = this.state[name];
        return (undefined === value || null === value) ? defaultValue : value;
    }

    /**
     * Set a command in this Interpretation.
     *
     * @param {String} name - the name of the command to set.
     * @param {Command} command - the command.
     */
    setCommand(name, command) {
        this.commands[name] = command;
    }

    /**
     * Does this Interpretation have defined a command?
     *
     * @param {String} name - the name of the command to check
     * @returns {Boolean} True if there exist a command with name in this
     * Interpretation
     */
    hasCommand(name) {
        return undefined !== this.getCommand(name);
    }

    /**
     * Does this Interpretation have this property?
     *
     * @param {String} name - the name of the property to check if it is
     * available in this interpretation
     *
     * @returns {Boolean} True if there exists a property with name in this
     * interpretation.
     */
    hasProperty(name) {
        return undefined !== this.getProperty(name);
    }
    
    /**
     * Apply all registered properties. Needs to be implemented in sub classes
     * to take an effect.
     */
    applyProperties() {
    }

    /**
     * Alias a command.
     *
     * @param {String|String[]} aliasNames - a list of aliases for command.
     * @param {String} commandName - a command's name.
     */
    alias(aliasNames, commandName) {
        if (!Array.isArray(aliasNames)) {
            aliasNames = [aliasNames];
        }

        for(const alias of aliasNames) {
            this.commands[alias] = commandName;
        }
    }

    /**
     * Get a command in this Interpretation.
     *
     * @param {String} name - the name of the command to get.
     * @returns {Command|undefined}
     */
    getCommand(name) {
        const command = this.commands[name];

        if (command instanceof Command) {
            return command;
        } else if ("string" === typeof command) {
            return this.getCommand(command);
        } else {
            return undefined;
        }
    }

    /**
     * Initialize a new rendering of this interpretation.
     */
    initialize() {
        _states.set(this, [Object.assign({}, _initialState.get(this))]);
        this.applyProperties();
    }

    /**
     * Render a moduleTree given this Interpretation.
     *
     * @param {ModuleTree} moduleTree - the moduleTree to render on the
     * canvas.
     */
    render(moduleTree) {
        this.initialize();
        renderTree(this, moduleTree);
        this.finalize();
    }

    /**
     * Enter a sub tree.
     */
    enter() {
        const currentState = Object.assign({}, this.state);
        _states.get(this).push(currentState);
        this.applyProperties();
    }

    /**
     * Exit a sub tree.
     */
    exit() {
        this.applyProperties();
        _states.get(this).pop();
    }

    /**
     * Finalize a rendering of this interpretation. Needs to be implemented in
     * concrete subclasses.
     */
    finalize() {
    }

    /**
     * Reset this Interpretation to the original state.
     */
    reset() {
        this.initialize();
    }
}

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
// Default values
const X = 0;
const Y = 0;
const D = 2;
const DELTA = Math.PI / 2;
const ALPHA = 0;

const FILL_COLOR = "fill-color";
const LINE_COLOR = "line-color";
const LINE_WIDTH = "line-width";
const LINE_JOIN = "line-join";

class TurtleInterpretation extends Interpretation {
    constructor(initialState = {}) {
        super(initialState);

        this.setCommand("+", new Command(function () {
            this.alpha = this.alpha + this.delta;
        }));

        this.setCommand("-", new Command(function () {
            this.alpha = this.alpha - this.delta;
        }));

        this.setCommand("f", new Command(function () {
            this.x = this.x + this.d * Math.cos(this.alpha);
            this.y = this.y + this.d * Math.sin(this.alpha);

            this.moveTo(this.x, this.y);
        }));
        
        this.setCommand("F", new Command(function () {
            this.x = this.x + this.d * Math.cos(this.alpha);
            this.y = this.y + this.d * Math.sin(this.alpha);

            this.lineTo(this.x, this.y);
        }));

        this.registerProperty(
            number$1("x", 100),
            number$1("y", 200),
            number$1("width", 600),
            number$1("height", 400),
            number$1("d", 10),
            number$1("alpha", 90),
            number$1("delta", 1),
            bool("close", false),
            number$1(LINE_WIDTH), 
            color(LINE_COLOR),
            string$1(LINE_JOIN),
            color(FILL_COLOR)
        );
    }

    /**
     * Move the pen to (x, y) without drawing a line
     *
     * @param {Number} x - the x coordinate
     * @param {Number} y - the y coordinate
     */
    moveTo(x, y) {
        // to be implemented by a sub class 
        console.log(x, y);
    }

    /**
     * Move the pen to (x, y) while drawing a line
     *
     * @param {Number} x - the x coordinate
     * @param {Number} y - the y coordinate
     */
    lineTo(x, y) {
        // to be implemented by a sub class 
        console.log(x, y);
    }

    get x() {
        return this.getProperty("x", X);
    }

    set x(value = 0) {
        this.setProperty("x", value);
    }

    get y() {
        return this.getProperty("y", Y);
    }

    set y(value = 0) {
        this.setProperty("y", value);
    }

    get d() {
        return this.getProperty("d", D);
    }

    set d(value = 1) {
        this.setProperty("d", value);
    }

    get alpha() {
        return this.getProperty("alpha", ALPHA);
    }

    set alpha(value = 0) {
        this.setProperty("alpha", value);
    }

    get delta() {
        return this.getProperty("delta", DELTA);
    }

    set delta(value = 1) {
        this.setProperty("delta", value);
    }

}

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
const _canvas = new WeakMap();

class CanvasTurtleInterpretation extends TurtleInterpretation {
    constructor(canvas, initialState = {}) {
        super(initialState);
        _canvas.set(this, canvas);
    }

    get canvas() {
        return _canvas.get(this);
    }

    get canvasElement() {
        return this.canvas.canvas;
    }

    initialize() {
        super.initialize();
        this.canvas.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
        this.canvas.beginPath();
        this.canvas.moveTo(this.x, this.y);
    }

    finalize() {
        super.finalize();
        if (this.getProperty("close", false)) {
            this.canvas.closePath();
        }
        this.canvas.stroke();
    }

    applyProperties() {
        if (this.hasProperty(LINE_WIDTH)) {
            this.canvas.lineWidth = this.getProperty(LINE_WIDTH);
        }

        if (this.hasProperty(LINE_COLOR)) {
            this.canvas.strokeStyle = this.getProperty(LINE_COLOR);
        }

        if (this.hasProperty(LINE_JOIN)) {
            this.canvas.lineJoin = this.getProperty(LINE_JOIN);
        }

        if (this.hasProperty(FILL_COLOR)) {
            this.canvas.fillStyle = this.getProperty(FILL_COLOR);
        }
    }

    moveTo(x, y) {
        this.canvas.moveTo(x, y);
    }

    lineTo(x, y) {
        this.applyProperties();

        this.canvas.lineTo(x, y);
        this.canvas.stroke();
    }

    enter() {
        super.enter();

        this.canvas.beginPath();
        this.canvas.moveTo(this.x, this.y);
    }

    exit() {
        super.exit();

        if (this.getProperty("close", false)) {
            this.canvas.closePath();
        }
        this.canvas.stroke();
        this.canvas.moveTo(this.x, this.y);
    }
        
}

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
const DEFAULT_WIDTH = 800;// px
const DEFAULT_HEIGHT = 600;// px
const SPEED = 500; // ms

const _element = new WeakMap();
const _lsystem = new WeakMap();
const _interpretation = new WeakMap();

const _running = new WeakMap();
const _animate = new WeakMap();
const _speed = new WeakMap();

const getProperty = function(map, path, defaultValue) {
    const levels = path.split(".");
    let level = 0;
    while (level < levels.length) {
        const name = levels[level];
        if (undefined !== map[name]) {
            map = map[name];
        } else {
            return defaultValue;
        }

        level++;
    }

    return undefined !== map ? map : defaultValue;
};

const createInterpretation = function (lab, interpretationConfig = {}) {
    let interpretation;
    if (!(interpretationConfig instanceof Interpretation)) {
        const element = document.createElement("canvas");
        element.width = getProperty(interpretationConfig, "config.width", DEFAULT_WIDTH);
        element.height = getProperty(interpretationConfig, "config.height", DEFAULT_HEIGHT);

        _element.set(lab, element);

        interpretation = new CanvasTurtleInterpretation(element.getContext("2d"), interpretationConfig.config);

        // Get all possible commands and their definitions, if any.
        const availableCommands = {};
        lab
            .lsystem
            .alphabet
            .moduleDefinitions
            .forEach((md) => {
                if (!interpretation.hasCommand(md.name)) {
                    availableCommands[md.name] = undefined;
                }
            });
       
        // Commands can be (re)defined in a configuration of an Interpretation 
        if ("commands" in interpretationConfig) {
            Object
                .entries(interpretationConfig["commands"])
                .forEach((entry) => {
                    const [name, func] = entry;
                    availableCommands[name] = func;
                });
        }

        Object.keys(availableCommands)
            .forEach((entry) => {
                const [name, func] = entry;
                interpretation.setCommand(name, new Command(func));
            });
    } else {
        interpretation = interpretationConfig;
    }

    _interpretation.set(lab, interpretation);
};

const createLSystem = function (lab, lsystem = "") {

    if (!(lsystem instanceof LSystem)) {
        // Interpret lsystem as a string to parse into an LSystem. Will
        // throw a parse error if it does not succeed
        lsystem = LSystem.parse(lsystem);
    }

    _lsystem.set(lab, lsystem);
};

const initializeAndRun = function (lab, derivationLength = 0) {
    if (!Number.isInteger(derivationLength) || 0 >= derivationLength) {
        derivationLength = 0;
    }
    lab.run(derivationLength);
};

const animateDeriving = function (lab, steps, currentStep) {
    if (_running.get(lab) && currentStep < steps) {
        setTimeout(() => {
            lab.interpretation.render(lab.derive());
            animateDeriving(lab, steps, currentStep + 1);
        }, _speed.get(lab));
    } else {
        _running.set(lab, false);
    }
};

const setupAnimation = function (lab, animate = false) {
    if (Number.isInteger(animate)) {
        if (0 < animate) {
            _animate.set(lab, true);
            _speed.set(lab, animate);
        } else {
            _animate.set(lab, false);
            _speed.set(lab, undefined);
        }
    } else if (animate && true === animate) {
        _animate.set(lab, true);
        _speed.set(lab, SPEED);
    } else {
        _animate.set(lab, false);
        _speed.set(lab, undefined);
    }
};

/**
 * Lab is the public API to interact with an lsystem and its interpretation.
 * Use this class to build an application on top of.
 *
 * Each Lab has a valid LSystem and a corresponding Interpretation. 
 *
 * @property {HTMLElement} element with the interpretation of the lsystem
 * @property {Interpretation} interpretation of the lsystem
 * @property {LSystem} lsystem being interpreted
 * @property {Boolean|Number} animate - control the animation of the
 * Interpretation
 */
class Lab {
    constructor(config = {}) {
        _running.set(this, false);

        createLSystem(this, config.lsystem || "");
        createInterpretation(this, config.interpretation);

        const animate = getProperty(config, "interpretation.config.animate", false);
        setupAnimation(this, animate);

        const derivationLength = getProperty(config, "interpretation.config.derivationLength", 0);
        initializeAndRun(this, derivationLength);
    }

    get element() {
        return _element.get(this);
    }

    get interpretation() {
        return _interpretation.get(this);
    }

    set interpretation(config = {}) {
        createInterpretation(this, config);
    }

    set lsystem(lsystem) {
        createLSystem(this, lsystem);
    }

    get lsystem() {
        return _lsystem.get(this);
    }

    get animate() {
        return _animate.get(this);
    }

    set animate(animate) {
        setupAnimation(this, animate);
    }
        
    // actions
    // control rendering

    /** 
     * Run this Lab by deriving this Lab's lsystem's successor for steps
     * times and interpret it.
     *
     * @param {Number} [steps = 0] - the number of derivations to perform.
     */
    run(steps = 0) {
        if (this.animate) {
            _running.set(this, true);
            animateDeriving(this, steps, 0);
        } else {
            this.interpretation.render(this.derive(steps));
        }
    }

    /**
     * Stop running this Lab.
     */
    stop() {
        _running.set(this, false);
    }

    /**
     * Derive the next sequence from this Lab's LSystem.
     *
     * @param {Integer} [derivationLength = 1] - the number of derivations to
     * perform, defaults to one step.
     *
     * @returns {ModuleTree} successor
     */
    derive(length = 1) {
        return this.lsystem.derive(length);
    }

    /**
     * Reset this lab to its initial state.
     */
    reset() {
        this.interpretation.reset();
        this.lsystem.reset(); 
    }
}

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
var STYLE = `
.lab-view {
    font-size: 12pt;
    font-family: Helvetica, Arial, sans-serif;
}

.lab-view .tabs {
    position: relative;
    min-height: 200px;
    height: 600px;
    clear: both;
    margin: 1px;
    padding: 0;
    
    background: #F5F5F5;
    border: 1px solid dimgray;
}

.lab-view .tab {
    list-style: none;
    float: left;
    height: 100%;
}

.lab-view .tab.right {
    float: right;
}

.lab-view .tab > label {
    padding: 0px 10px 4px 10px;
    left: 1px;
}

.lab-view .tab > label:hover {
    background: #E5E5E5;
}

.lab-view .tab > input[type="radio"] {
    display: none;
}

.lab-view .tab .contents {
    position: absolute;
    top: 26px;
    left: 0;
    background: white;
    right: 0;
    bottom: 0;
    padding: 5px;
    padding-bottom: 10px;
    border-top: 1px solid dimgray;
    overflow: auto;
}

.lab-view .tab > input[type=radio]:checked ~ label {
    background: dimgray;
    color: white;
    border-bottom: 1px white;
    z-index: 2;
}

.lab-view .tab > input[type=radio]:checked ~ label ~ .contents {
    z-index: 1;
}

.lab-view .tab > .contents h1 {
    font-size: 16pt;
    margin-top: 10px;
}

.lab-view .tab > .contents h2 {
    font-size: 14pt;
}

.lab-view .tab .actions {
    margin: 0;
    padding: 0;
    position: sticky;
    left: 0px;
    top: 0px;
}

.lab-view .tab .actions li {
    list-style: none;
    float: left;
}

.lab-view .tab .actions button {
    padding: 0px;
    margin: 1px;
    color: black;
}

.lab-view .tab .actions .spacer {
    padding-left: 5px;
    color: transparent;
}

.lab-view .tab .contents .messages p {
    border: 1px solid dimgray;
    padding: 1ex;
    margin: 1ex;
}

.messages .error {
    border-color: crimson;
    background-color: lightsalmon;
}

.messages .info {
    border-color: slateblue;
    background-color: lavender;
}

.lab-view .lsystem {
    width: 100%;
    height: 90%;
}

.lab-view pre {
    clear: left;
    padding: 1ex;
    overflow-x: auto;
    background-color: #f9f9f9;
}

.lab-view [data-section="lsystem"] .editor {
    width: 100%;
    height: 83%;
    clear: left;
    padding-top: 1ex;
}

.lab-view [data-section="lsystem"] textarea {
    width: 99%;
    height: 100%;
}

.lab-view [data-section="interpretation"] .property-editor {
    clear: left;
    padding-top: 1ex;
}

.lab-view .interpretation-contents {
    overflow-y: auto;
    height: 83%;
    clear: left;
}

.lab-view .property-editor table {
    border-collapse: collapse;
}

.lab-view .property-editor th {
    text-align: left;
}

.lab-view .property-editor th, .lab-view .property-editor td {
    padding: 0.5ex;
}

.lab-view .property-editor td.value {
    width: 100%;
}

.lab-view .property-editor textarea {
    width: 100%;
}

`;

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
var ABOUT = `
<p>
    virtual_botanical_laboratory © 2017 Huub de Beer &lt;<a href="mailto:Huub@heerdebeer.org">Huub@heerdebeer.org</a>&gt;.
</p>
<p>
 virtual_botanical_laboratory is free software: you can redistribute it
 and/or modify it under the terms of the GNU General Public License as
 published by the Free Software Foundation, either version 3 of the License,
 or (at your option) any later version.
</p>
<p>
 virtual_botanical_laboratory is distributed in the hope that it will be
 useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General
 Public License for more details.
</p>
<p>
 You should have received a copy of the GNU General Public License along
 with virtual_botanical_laboratory.  If not, see
 &lt;<a href="http://www.gnu.org/licenses/">http://www.gnu.org/licenses/</a>&gt;.
</p>
`;

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
var HELP = `
<p>
    To do ...
</p>
`;

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
var EXPORT_HTML_TEMPLATE = `
    <head>
        <meta charset="utf-8">
        <title>Virtual Botanical Laboratory—__NAME__</title>
        <script src="__SOURCE_URL__"></script>
        <style>
            figcaption {
                font-style: italic;
            }

            figcaption .generator {
                font-size: smaller;
            }
        </style>
    <body>
        <figure>
            <figcaption>
                __DESCRIPTION__<br>
                <span class="generator">Generated by <a href="_https://github.com/htdebeer/virtual_botanical_laboratory">virtual_botanical_laboratory</a></span>
            </figcaption>
        </figure>
        <script>
            new virtual_botanical_laboratory.LabView(document.querySelector("figure"), __CONFIGURATION__);
        </script>`;

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
var EMPTY_CONFIGURATION = `{
    "name": "New Laboratory",
    "description": "New Laboratory. See '?' for help.",
    "lsystem": "lsystem(alphabet: {F}, axiom: F, productions: {F -> F F})",
    "interpretation": {
        "config": {
            "derivationLength": 1,
            "y": 50
        }
    }
}`;

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

const _name$3 = new WeakMap();
const _icon = new WeakMap();
const _tooltip = new WeakMap();
const _callback = new WeakMap();

const _enabled = new WeakMap();

const _element$2 = new WeakMap();

/**
 * Action
 *
 * @property {String} name
 * @property {String} icon
 * @property {String} tooltip
 * @property {Boolean} enabled
 */
class Action {
    constructor(name, icon, tooltip, callback, enabled = true) {
        _name$3.set(this, name);
        _icon.set(this, icon);
        _tooltip.set(this, tooltip);
        _callback.set(this, callback);
        _enabled.set(this, enabled);
    }

    get name() {
        return _name$3.get(this);
    }

    get icon() {
        return _icon.get(this);
    }

    get tooltip() {
        return _tooltip.get(this);
    }

    isEnabled() {
        return true === _enabled.get(this);
    }

    enable() {
        _enabled.set(this, true);
    }

    disable() {
        _enabled.set(this, false);
    }

    execute() {
        _callback.get(this).call(null);
    }

    set element(elt) {
        _element$2.set(this, elt);
    }

    get element() {
        return _element$2.get(this);
    }



}

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

class Spacer extends Action {
    constructor() {
        super("", "|", "", () => false, false);
    }
}

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
const _config$1 = new WeakMap();
const _element$1 = new WeakMap();

const _actions = new WeakMap();
const _actionBar = new WeakMap();

const createAction = function (view, action) {
    const element = document.createElement("li");

    if (action instanceof Spacer) {
        element.classList.add("spacer");
        element.innerHTML = action.icon;
    } else {
        const button = document.createElement("button");
        button.dataset.action = action.name;
        button.setAttribute("type", "button");
        button.setAttribute("title", action.tooltip);
        button.innerHTML = action.icon;

        if (!action.isEnabled()) {
            button.setAttribute("disabled", "disabled");
        }

        button.addEventListener("click", () => action.execute());

        element.appendChild(button);
    }
    
    _actionBar.get(view).appendChild(element);
    action.element = element;
    _actions.get(view).push(action);
};

const createView = function (view, name, header, parentElt) {
    const contents = document.createElement("div");
    contents.classList.add("contents");
    contents.dataset.name = name;
    parentElt.appendChild(contents);

    if (header) {
        const headerElt = document.createElement("h1");
        headerElt.innerHTML = header;
        contents.appendChild(headerElt);
    }
    
    const messagePane = document.createElement("div");
    messagePane.classList.add("messages");
    messagePane.style.display = "none";
    contents.appendChild(messagePane);

    const actionBar = document.createElement("ul");
    actionBar.classList.add("actions");
    contents.appendChild(actionBar);
    _actionBar.set(view, actionBar);

    _element$1.set(view, contents);
};

/**
 * View represents a tab in the LabView.
 *
 * @property {HTMLElement} element
 */
class View {

    constructor(parentElt, name, config = {}) {
        _actions.set(this, []);
        createView(this, name, config.header, parentElt);
        this.configure(config);
    }

    get element() {
        return _element$1.get(this);
    }

    showMessage(message, type = "info", timeout = false) {
        const messagePane = this.element.querySelector("div.messages");
        if (null !== messagePane) {
            messagePane.innerHTML = `<p class="${type}">${message}</p>`;
            messagePane.style.display = "block";
            if (Number.isInteger(timeout)) {
                setTimeout(() => this.hideMessage(), parseInt(timeout));
            }
        }
    }

    hideMessage() {
        const messagePane = this.element.querySelector("div.messages");
        if (null !== messagePane) {
            messagePane.style.display = "none";
        }
    }

    /**
     * Get action by name
     * 
     * @param {String} name - the name of the action to get.
     * @return {Action} the action or undefined if it cannot be found
     */
    action(name) {
        const foundActions = _actions.get(this).filter((a) => a.name === name);
        if (0 < foundActions.length) {
            return foundActions[0];
        } else {
            return undefined;
        }
    }

    addAction(action) {
        createAction(this, action);
    }

    removeAction(name) {
        const action = this.action(name);
        if (undefined !== action) {
            _actionBar.get(this).removeChild(action.element);
            const actionIndex = _actions.get(this).indexOf(action);
            _actions.get(this).splice(actionIndex, 1);
        }
    }

    configure(config = {}) {
        _config$1.set(this, config);
    }
}

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

const _canvas$1 = new WeakMap();

/**
 * View represents a tab in the LabView.
 *
 * @property {HTMLCanvasElement} canvas
 */
class RenderView extends View {

    constructor(elt, config = {}) {
        super(elt, "render", config);
    }

    get canvas() {
        return _canvas$1.get(this);
    }

    set canvas(canvasElement) {
        if (this.element.contains(this.canvas)) {
            this.element.removeChild(this.canvas);
        }
        _canvas$1.set(this, canvasElement);
        this.element.appendChild(this.canvas);
    }

}

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
const _contents = new WeakMap();

/**
 * DocumentView represents a tab with textual contents only.
 *
 * @property {String} contents, a HTML String detailing the contents of this
 * DocumentView.
 */
class DocumentView extends View {

    /**
     * Create a new DocumentView.
     *
     * @param {HTMLElement} elt
     * @param {String} name
     * @param {Object} config. If config contains a String property
     * 'contents', that is used as this DocumentView's contents.
     */
    constructor(elt, name, config = {}) {
        super(elt, name, config);
        this.contents = config.contents || "";
    }

    get contents() {
        return _contents.get(this);
    }

    set contents(str) {
        let contentsEl = this.element.querySelector(".document-contents");
        if (null === contentsEl) {
            contentsEl = document.createElement("div");
            contentsEl.classList.add("document-contents");
            this.element.appendChild(contentsEl);
        }
        contentsEl.innerHTML = str;
        _contents.set(this, str);
    };

}

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
const TAB = 9;
const INDENT = "  ";
const _originalLSystem = new WeakMap();

/**
 * View represents a tab in the LabView.
 *
 * @property {String} lsystem
 */
class LSystemView extends View {

    constructor(elt, lsystem, config = {}) {
        super(elt, "lsystem", config);
        _originalLSystem.set(this, lsystem);
        this.lsystem = lsystem;
    }

    get originalLSystem() {
        return _originalLSystem.get(this);
    }

    set originalLSystem(lsystem) {
        _originalLSystem.set(this, lsystem);
    }

    get lsystem() {
        let textarea = this.element.querySelector("textarea");
        if (null === textarea) {
            return "";
        } else {
            return textarea.value;
        }
    }

    set lsystem(str) {
        let textarea = this.element.querySelector("textarea");

        if (null === textarea) {
            const editorElement = document.createElement("div");
            editorElement.classList.add("editor");
            textarea = document.createElement("textarea");

            // allow for tab key
            textarea.addEventListener("keydown", (event) => {
                if (TAB === event.which) {
                    const start = textarea.selectionStart;
                    const end = textarea.selectionEnd;
                    textarea.value = 
                        `${textarea.value.substr(0, start)}${INDENT}${textarea.value.substr(end)}`;
                    textarea.selectionStart = textarea.selectionEnd = start + INDENT.length;
                    event.preventDefault();
                    return false;
                }
            });

            editorElement.appendChild(textarea);
            this.element.appendChild(editorElement);
        }

        textarea.value = str;
    }
}

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

const ROWS = 10;

const _element$3 = new WeakMap();
const _propertySpecifications = new WeakMap();
const _properties = new WeakMap();
const _propertyElements = new WeakMap();

const _editable = new WeakMap();

const _addSelect = new WeakMap();
const _propertyTable = new WeakMap();

const restOfProperties = function (editor) {
    return editor
        .propertySpecifications
        .filter(p => {
            return !editor.hasProperty(p.name);
        })
    ;
};

const createTableHead = function (keyLabel = "key", valueLabel = "value") {
    const tableHead = document.createElement("thead");
    
    const headRow = document.createElement("tr");

    const keyHeadCell = document.createElement("th");
    keyHeadCell.textContent = keyLabel;
    
    const valueHeadCell = document.createElement("th");
    valueHeadCell.textContent = valueLabel;
    
    headRow.appendChild(keyHeadCell);
    headRow.appendChild(valueHeadCell);
    headRow.appendChild(document.createElement("th"));
    
    tableHead.appendChild(headRow);

    return tableHead;
};

const createOption = function (name) {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    return option;
};

const createRow = function (editor, propertyName) {
    const propertySpecification = editor.getPropertySpecification(propertyName);
    let propertyValue = editor.getProperty(propertyName);
       
    if (undefined === propertyValue) {
        propertyValue = propertySpecification.default;
    }
       
    if (undefined === propertyValue) {
        propertyValue = "";
    }

    editor.setProperty(propertyName, propertyValue);

    const row = document.createElement("tr");
    const keyCell = document.createElement("th");
    keyCell.textContent = propertyName;
    row.appendChild(keyCell);

    const valueCell = document.createElement("td");
    valueCell.classList.add("value");
    let valueEditor;
    if ("textarea" === propertySpecification.type) {
        valueEditor = document.createElement("textarea");
        valueEditor.setAttribute("rows", ROWS);
    } else {
        valueEditor = document.createElement("input");
        valueEditor.setAttribute("type", propertySpecification.type);

        if ("number" === propertySpecification.type) {
            valueEditor.setAttribute("step", "any");
        }
    }
    valueEditor.value = propertyValue;
    valueCell.appendChild(valueEditor);
    _propertyElements.get(editor)[propertyName] = valueEditor;
    row.appendChild(valueCell);

    if (editor.editable) {
        const deleteCell = document.createElement("td");
        const deleteButton = document.createElement("button");
        deleteButton.classList.add("action");
        deleteButton.classList.add("delete");
        deleteButton.setAttribute("type", "button");
        deleteButton.textContent = "×";
        deleteButton.addEventListener("click", () => {
            editor.deleteProperty(propertyName);
            row.parentNode.removeChild(row);
            _addSelect.get(editor).appendChild(createOption(propertyName));
        });
        deleteCell.appendChild(deleteButton);
        row.appendChild(deleteCell);
    } else {
        row.appendChild(document.createElement("td"));
    }

    return row;
};

const createAddRow = function (editor, addLabel) {
    const row = document.createElement("tr");
    const addCell = document.createElement("td");
    addCell.setAttribute("colspan", 3);
    const select = document.createElement("select");
    
    const label = document.createElement("option");
    label.textContent = addLabel;
    select.appendChild(label);

    restOfProperties(editor).forEach((p) => select.appendChild(createOption(p.name)));

    select.addEventListener("change", () => {
        if (1 <= select.selectedIndex) {
            const selectedOption = select.options[select.selectedIndex];
            const name = selectedOption.value;
            _propertyTable.get(editor).insertBefore(createRow(editor, name), row); 
            select.removeChild(selectedOption);
        }

        select.selectedIndex = 0;
    });

    _addSelect.set(editor, select);

    addCell.appendChild(select);

    row.appendChild(addCell);
    return row;
};

const createTableBody = function (editor, config = {}) {
    const tableBody = document.createElement("tbody");
    Object.keys(editor.properties).forEach(property => {
        tableBody.appendChild(createRow(editor, property));
    });

    if (editor.editable) {
        tableBody.appendChild(createAddRow(editor, config.addLabel || "Add property…"));
    }

    _propertyTable.set(editor, tableBody);

    return tableBody;
};

const createPropertyEditor$1 = function (editor, config) {
    const editorElement = document.createElement("div");
    editorElement.classList.add("property-editor");

    if (undefined !== config.header) {
        const header = document.createElement("h2");
        header.textContent = config.header;
        editorElement.appendChild(header);
    }

    const table = document.createElement("table");
    table.appendChild(createTableHead(config.keyLabel, config.valueLabel));
    table.appendChild(createTableBody(editor, config));
    editorElement.appendChild(table);
    
    _element$3.set(editor, editorElement);
};

/**
 * A PropertyEditor is an editor for key-value pairs, for a finite set of
 * keys.
 *
 * @property {HTMLElement} element - this PropertyEditor's HTML element
 * @property {Boolean} editable - is this PropertyEditor editable
 * @property {Object} properties - the properties that are set
 * @property {Object} propertySpecifications - the specifications of all
 * properties to edit
 * @property {String[]} propertyValues - the values of the set properties
 *
 */
class PropertyEditor {
    constructor(propertySpecifications, properties = {}, config = {}) {
        _propertySpecifications.set(this, propertySpecifications);
        _properties.set(this, properties);
        _propertyElements.set(this, {});

        _editable.set(this, undefined === config.editable ? true : (true === config.editable) );

        createPropertyEditor$1(this, config);
    }

    get element() {
        return _element$3.get(this);
    }

    get editable() {
        return true === _editable.get(this);
    }

    get propertySpecifications() {
        return _propertySpecifications.get(this);
    }

    get properties() {
        return _properties.get(this);
    }

    get propertyValues() {
        const props = {};
        Object.keys(_properties.get(this)).forEach((name) => {
            props[name] = _propertyElements.get(this)[name].value;
        });
        return props;
    }

    hasProperty(name) {
        return name in this.properties;
    }

    getProperty(name) {
        return _properties.get(this)[name];
    }

    setProperty(name, value) {
        if (this.isAllowedProperty(name)) {
            this.properties[name] = value;
            // update editor
        } else {
            console.error(`Setting property '${name}' is not allowed. Expected property to be one of {${this.propertySpecifications.map(p => p.name).join(", ")}}.`);
        }
    }

    deleteProperty(name) {
        if (this.hasProperty(name)) {
            delete this.properties[name];
        }
    }

    getPropertySpecification(name) {
        return this.propertySpecifications.find((p) => name === p.name);
    }

    isAllowedProperty(name) {
        return undefined !== this.getPropertySpecification(name);
    }


}

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
const _propertyEditor = new WeakMap();
const _commandEditor = new WeakMap();

const createPropertyEditor = function(view, properties, definedProperties) {
    const propertyEditor = new PropertyEditor(properties, definedProperties, {
        header: "Properties",
        keyLabel: "Name",
        valueLabel: "Value",
        addLabel: "Add property"
    });

    _propertyEditor.set(view, propertyEditor);
    return propertyEditor;
};

const createCommandPropertyEditor = function(view, commands, definedCommands) {
    const commandEditor = new PropertyEditor(commands, definedCommands, {
        header: "Commands",
        keyLabel: "Name",
        valueLabel: "Definition",
        addLabel: "Add command definition",
        editable: false
    });

    _commandEditor.set(view, commandEditor);
    return commandEditor;
};


/**
 * View represents a tab in the LabView.
 *
 */
class InterpretationView extends View {

    constructor(elt, interpretation, interpretationConfig = {}, config = {}) {
        super(elt, "interpretation", config);

        const container = document.createElement("div");
        container.classList.add("interpretation-contents");

        const properties = interpretation.registeredProperties;

        container.appendChild(createPropertyEditor(this, properties, interpretationConfig.config).element);
        
        const commands = Object.keys(interpretation.commands).map(command => {
            return {
                name: command,
                type: "textarea",
                default: "",
                converter: (s) => s
            };
        });
        
        const definedCommands = {};

        Object.keys(interpretation.commands).forEach(name => {
            const command = interpretation.commands[name];
            definedCommands[name] = command.toString();
        });

        if (undefined !== interpretationConfig.commands) {
            Object.keys(interpretationConfig.commands).forEach(name => {
                const command = new Command(interpretationConfig.commands[name]);
                definedCommands[name] = command.toString();
            });
        }

        container.appendChild(createCommandPropertyEditor(this, commands, definedCommands).element);
        this.element.appendChild(container);
    }

    get properties() {
        return _propertyEditor.get(this).propertyValues;
    }

    get commands() {
        return _commandEditor.get(this).propertyValues;
    }
}

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
const _lab = new WeakMap();
const _config = new WeakMap();

const _tabs = new WeakMap();

const _paused = new WeakMap();

const saveAs = function (labView, extension, dataURI) {
    const name = labView.name.replace(/[ \t\n\r]+/g, "_");

    const a = document.createElement("a");
    a.download = `${name}.${extension}`,
    a.href = dataURI;
    document.body.appendChild(a);
    a.addEventListener("click", () => document.body.removeChild(a));
    a.click();
};

const scriptURL = function () {
    // Get the source code by URL; assuming the script is loaded
    // by a path ending in 'virtual_botanical_laboratory.js'.
    const scripts = Array.from(document.querySelectorAll("script"));
    const labScript = scripts.filter((s) => s.src.endsWith("virtual_botanical_laboratory.js"));
    return labScript[0].src;
};

const tab = function (labview, name) {
    const tabs = _tabs.get(labview);
    if (undefined !== tabs && tabs.hasOwnProperty(name)) {
        return tabs[name];
    } else {
        return undefined;
    }
};

const generateId = function () {
    let randomId;
    do {
        randomId = Math.random().toString(16).slice(2);
    } while (null !== document.getElementById(randomId));

    return randomId;
};

const createTab = function (labview, name, text, tooltip, checked = false, right = false) {
    const tab = document.createElement("li");
    tab.classList.add("tab");
    if (right) {
        tab.classList.add("right");
    }
    tab.dataset.section = name;

    const id = generateId();
    const input = document.createElement("input");
    input.setAttribute("type", "radio");
    input.setAttribute("name", "tabs");
    input.setAttribute("id", id);
    if (checked) {
        input.setAttribute("checked", "checked");
    }
    tab.appendChild(input);

    const label = document.createElement("label");
    label.setAttribute("for", id);
    label.setAttribute("title", tooltip);
    label.innerHTML = text;
    tab.appendChild(label);

    return tab;
};

const updateLSystem = function (labview, lsystemTab) {
    const lsystemString = lsystemTab.lsystem;
    // If the lsystem has been changed, try to parse it and update lsystem
    if (lsystemTab.originalLSystem !== lsystemString) {
        try {
            const lsystem = LSystem.parse(lsystemTab.lsystem);
            labview.reset();
            labview.lab.lsystem = lsystem;
            lsystemTab.originalLSystem = lsystemString;
            lsystemTab.showMessage("LSystem parsed and updated successfully.", "info", 2000);
            _config.get(labview)["lsystem"] = lsystemString;
        } catch (e) {
            lsystemTab.showMessage(`Error parsing LSystem: "${e}"`, "error");
        }
    }
};

const updateInterpretation = function (labview, interpretationTab) {
    const properties = interpretationTab.properties;
    const commands = interpretationTab.commands;

    const changed = true; // TODO determine if interpretation specification has changed

    if (changed) {
        // update interpretation
        try {

            const config = {};
            Object.entries(properties).forEach(([key, value]) => {
                const registeredProperty = labview.lab.interpretation.getRegisteredProperty(key);
                const converter = registeredProperty["converter"] || function (v) { return v.toString();};
                config[key] = converter.call(null, value);
            });

            const interpretationConfig = {
                "config": config,
                "commands": {}
            };

            _config.get(labview)["interpretation"] = interpretationConfig;

            const lsystem = labview.lab.lsystem.stringify();

            labview.reset();

            labview.lab = new Lab({
                "lsystem": lsystem,
                "interpretation": interpretationConfig
            });

            Object.entries(commands).forEach(([key, func]) => {
                if (undefined !== func && "" !== func) {
                    const modules = labview.lab.lsystem.alphabet.moduleDefinitions;
                    let parameters = [];
                    if (undefined !== modules) {
                        parameters = modules.find((md) => key === md.name);
                        if (undefined !== parameters) {
                            parameters = parameters.parameters;
                        } else {
                            parameters = [];
                        }
                    }

                    const command = new Command(parameters, func);
                    labview.lab.interpretation.setCommand(key, command);
                }
            });

            //labview.lab = labview.lab;
            interpretationTab.showMessage("Interpretation updated successfully..", "info", 2000);
        } catch (e) {
            console.log(e);
            interpretationTab.showMessage(`Error updating interpretation: "${e}"`, "error");
        }
    }
};

const setupTabs = function (labview, element, tabConfig) {
    const tabsElement = document.createElement("ul");
    tabsElement.classList.add("tabs");
    element.appendChild(tabsElement);

    const tabs = {};

    // General "render" tab to view and control L-System
    const renderTabElement = createTab(labview, "render", "♣", "View interpreted L-System", true);
    tabsElement.appendChild(renderTabElement);
    const renderTab = tabs["render"] = new RenderView(renderTabElement, {});

    renderTab.addAction(new Action("create", "★", "Create a new L-System.", () => labview.create()));
    renderTab.addAction(new Action("exportToHtml", "▼ HTML", "Save this L-System to a HTML file.", () => labview.exportToHTML()));
    renderTab.addAction(new Action("exportToPng", "▼ PNG", "Export this L-System to a PNG file.", () => labview.exportToPNG()));

    renderTab.addAction(new Spacer());

    renderTab.addAction(new Action("run", "▶️", "Run this L-System.", () => labview.run()));
    renderTab.addAction(new Action("pause", "⏸", "Pause this L-System.", () => labview.pause()));
    renderTab.addAction(new Action("step", "1", "Derive the next succesor of this L-System.", () => labview.step()));
    renderTab.addAction(new Action("reset", "⏮", "Reset this L-System.", () => labview.reset()));

    // L-System tab to edit L-System definition
    const lsystemTabElement = createTab(labview, "lsystem", "L-System", "Edit L-System");
    tabsElement.appendChild(lsystemTabElement);
    tabs["lsystem"] = new LSystemView(lsystemTabElement, tabConfig.lsystem, {
        header: "L-System definition"
    });
    tabs["lsystem"].addAction(
        new Action(
            "update", 
            "update", 
            "Update this L-System.", 
            () => updateLSystem(labview, tabs["lsystem"])
        )
    );
    
    // Interpretation tab to change properties in the interpretation
    const interpretationTabElement = createTab(labview, "interpretation", "Interpretation", "Edit interpretation");
    tabsElement.appendChild(interpretationTabElement);
    tabs["interpretation"] = new InterpretationView(interpretationTabElement, labview.lab.interpretation, tabConfig.interpretation, {
        header: "Configure interpretation"
    });
    tabs["interpretation"].addAction(
        new Action(
            "update", 
            "update", 
            "Update this L-System.", 
            () => updateInterpretation(labview, tabs["interpretation"])
        )
    );
    
    // About tab with information about the virtual_botanical_lab
    const aboutTabElement = createTab(labview, "about", "i", "About", false, true);
    tabsElement.appendChild(aboutTabElement);
    tabs["about"] = new DocumentView(aboutTabElement, "about", {
        header: "About",
        contents: ABOUT
    });
    
    // Help tab with a manual for the virtual_botanical_lab
    const helpTabElement = createTab(labview, "help", "?", "help", false, true);
    tabsElement.appendChild(helpTabElement);
    tabs["help"] = new DocumentView(helpTabElement, "help", {
        header: "Help",
        contents: HELP
    });

    _tabs.set(labview, tabs);
};

const createLabView = function (labview, parentElementOrSelector, config) {
    const style = document.createElement("style");
    style.textContent = STYLE;
    document.head.appendChild(style);

    const template = document.createElement("div");
    template.classList.add("lab-view");

    let elt;
    if (parentElementOrSelector instanceof Node) {
        elt = parentElementOrSelector;
    } else {
        elt = document.querySelector(parentElementOrSelector);
    }

    if (elt.firstChild) {
        elt.insertBefore(template, elt.firstChild);
    } else {
        elt.append(template);
    }

    setupTabs(labview, template, config);

    return elt;
};

/**
 * A user interface for a Lab.
 *
 * @property {Lab} lab
 */
class LabView {

    /**
     * Create a new LabView.
     *
     * @param {HTMLElement|String} parentElementOrSelector - the parent
     * element, or a selector to the parent element, to which this LabView
     * will be appended.
     * @param {Object} [config = {}] - the initial configuration of this
     * LabView.
     */
    constructor(parentElementOrSelector, config = {}) {
        // TODO: It is probably a good idea to validate the config first, though.
        _config.set(this, Object.create(null, {}));
        Object.assign(_config.get(this), config);
        _lab.set(this, new Lab(config));

        createLabView(this, parentElementOrSelector, config);
        
        this.lab = this.lab;

        _paused.set(this, false);
    }

    get name() {
        let name = "virtual_plant";
        if (this.lab && this.lab.lsystem && "" !== this.lab.lsystem.name) {
            name = this.lab.lsystem.name;
        }
        return name;
    }

    get description() {
        let description = "Plant generated by the virtual botanical laboratory.";
        if (this.lab && this.lab.lsystem && "" !== this.lab.lsystem.description) {
            description = this.lab.lsystem.description;
        }
        return description;
    }

    get configuration() {
        return JSON.stringify({
            "name": this.name,
            "description": this.description,
            "lsystem": _config.get(this)["lsystem"],
            "interpretation": _config.get(this)["interpretation"]
        }, null, 4);
    }

    get lab() {
        return _lab.get(this);
    }

    set lab(newLab) {
        _lab.set(this, newLab);
        tab(this, "render").canvas = this.lab.element;
    }

    // Control the lab view

    set(sectionName, key, value) {
        let section = _config.get(this)[sectionName];
        if (undefined === section) {
            section = Object.create(null);
            _config.get(this)[sectionName] = section;
        }
        section[key] = value;
    }

    get(sectionName, key) {
        const section = _config.get(this)[sectionName];
        return undefined === section ? section[key] : undefined;
    }

    // File and export actions

    /**
     * Create an empty Lab in a new window/tab.
     */
    create() {
        const htmlCode = EXPORT_HTML_TEMPLATE
            .replace(/__NAME__/, "New Laboratory")
            .replace(/__SOURCE_URL__/, scriptURL())
            .replace(/__DESCRIPTION__/, "New Laboratory. See '?' for help.")
            .replace(/__CONFIGURATION__/, EMPTY_CONFIGURATION);

        const newLabWindow = window.open();
        newLabWindow.document.write(htmlCode);
        newLabWindow.document.close();
    }

    /**
     * Export the current lsystem and its configuration to a stand-alone HTML
     * file.
     */
    exportToHTML() {
        if (undefined !== this.lab) {
            const htmlCode = "<!DOCTYPE html>\n<html>\n" + 
                EXPORT_HTML_TEMPLATE
                .replace(/__NAME__/, this.name)
                .replace(/__SOURCE_URL__/, scriptURL())
                .replace(/__DESCRIPTION__/, this.description)
                .replace(/__CONFIGURATION__/, this.configuration);

            const data = new Blob([htmlCode], {type: "text/html"});
            saveAs(this, "html", URL.createObjectURL(data));
        }
    }

    /**
     * Export the current interpretation to a PNG file.
     */
    exportToPNG() {
        if (undefined !== this.lab) {
            const dataURI = this.lab
                .interpretation
                .canvasElement
                .toDataURL("image/png")
                .replace(/^data:image\/[^;]/, "data:application/octet-stream");
            
            saveAs(this, "png", dataURI);
        }
    }

    // Control a lab actions

    run() {
        if (undefined !== this.lab) {
            const derivationLength = getProperty(_config.get(this), "interpretation.config.derivationLength", 0);

            const steps = derivationLength - this.lab.lsystem.derivationLength;
            this.lab.run(steps);

            _paused.set(this, false);
        }
    }

    step() {
        if (undefined !== this.lab) {
            this.lab.run(1);
        }
    }

    pause() {
        if (undefined !== this.lab) {
            this.lab.stop();
            _paused.set(this, true);
        }
    }

    isPaused() {
        return true === _paused.get(this);
    }

    reset() {
        if (undefined !== this.lab) {
            this.lab.reset();
            _paused.set(this, false);
        }
    }

}

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
window.virtual_botanical_laboratory = window.virtual_botanical_laboratory || {
    LexicalError,
    ParseError,
    LSystem,
    Interpretation,
    TurtleInterpretation,
    CanvasTurtleInterpretation,
    Lab,
    LabView
};
//# sourceMappingURL=virtual_botanical_laboratory.js.map
