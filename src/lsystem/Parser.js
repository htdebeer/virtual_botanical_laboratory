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
import {
    Lexer,
    NUMBER,
    IDENTIFIER,
    BRACKET_OPEN,
    BRACKET_CLOSE,
    OPERATOR,
    DELIMITER,
    KEYWORD
} from "./Lexer.js";
import {ParseError} from "./ParseError.js";
import {LSystem} from "./LSystem.js";
import {Module} from "./Module.js";
import {ModuleDefinition} from "./ModuleDefinition.js";

import {Alphabet} from "./Alphabet.js";

import {Successor} from "./Successor.js";
import {Predecessor} from "./Predecessor.js";
import {Production} from "./Production.js";
import {StochasticProduction} from "./StochasticProduction.js";

import {BooleanExpression} from "./BooleanExpression.js";
import {NumericalExpression} from "./NumericalExpression.js";

const _lexer = new WeakMap();
const _idTable = new WeakMap();

// Scopes
const MODULE = Symbol("MODULE");
const PARAMETER = Symbol("PARAMETER");

// Contexts
const CONTEXT = Symbol("CONTEXT");
const BOOL_EXPR = Symbol("BOOL_EXPR");
const ACTUAL_PARAMETERS = Symbol("ACTUAL_PARAMETERS");
const MODULE_NAME = Symbol("MODULE_NAME");

const installIdentifier = function (parser, identifierToken, scope = MODULE) {
    const idTable = _idTable.get(parser);
    const name = identifierToken.value;
    if (!defined(parser, name, scope)) {
        idTable.push({name, scope});
    } else {
        throw new ParseError(`'name' at ${identifierToken.position()} is already defined.`);
    }
};

const defined = function (parser, name, scope = MODULE) {
    const idTable = _idTable.get(parser);
    return idTable.find((id) => id.name === name && id.scope === scope);
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
        throw new ParseError(`expected ${name.toString()}${undefined !== value ? " with value '" + value + "'": ''} at ${token.position()}`);
    }
}

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

    return new ModuleDefinition(moduleName, formalParameters);
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
    const op = match(parser, OPERATOR).value;
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

const parseActualModule = function (parser) {
    const moduleNameToken = match(parser, IDENTIFIER, undefined, MODULE_NAME);
    const moduleName = moduleNameToken.value;

    if (!defined(parser, moduleName, MODULE)) {
        throw new ParseError(`Module '${moduleName}' at position ${moduleToken.position()} not in the alphabet.`);
    }

    let actualParameters = [];
   
    if (lookAhead(parser, BRACKET_OPEN, "(")) {
        match(parser, BRACKET_OPEN, "(");
        actualParameters = parseList(parser, parseActualParameter);
        match(parser, BRACKET_CLOSE, ")");

        // TODO: check match formal module
    }

    return new Module(moduleName, actualParameters);
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
            successor.push(parseActualModule(parser));
        }
    }

    return successor;
};

const parseAxiom = function (parser) {
    match(parser, KEYWORD, "axiom");
    match(parser, DELIMITER, ":");
    const axiom = parseSuccessor(parser);
    return axiom;
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
    const modules = []
    let hasLeftContext = false;
    let hasRightContext = false;
   
    modules.push(parseActualModule(parser));
    
    if (lookAhead(parser, BRACKET_OPEN, "<", 1, CONTEXT)) {
        match(parser, BRACKET_OPEN, "<", CONTEXT);
        modules.push(parseActualModule(parser));
        hasLeftContext = true;
    }
    
    if (lookAhead(parser, BRACKET_CLOSE, ">", 1, CONTEXT)) {
        match(parser, BRACKET_CLOSE, ">", CONTEXT);
        modules.push(parseActualModule(parser));
        hasRightContext = true;
    }

    let predecessor = undefined;

    if (1 === modules.length) {
        predecessor = new Predecessor(modules[0]);
    } else if (2 === modules.length) {
        if (hasLeftContext) {
            predecessor = new Predecessor(modules[1]);
            predecessor.leftContext = modules[0];
        } else {
            predecessor = new Predecessor(modules[0]);
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
    const ignoreList = parseList(parser, parseActualModule, "}");
    match(parser, BRACKET_CLOSE, "}");
    return ignoreList;
};

const parseLSystem = function (parser) {
    match(parser, KEYWORD, "lsystem");
    match(parser, BRACKET_OPEN, "(");
    const alphabet = parseAlphabet(parser);
    match(parser, DELIMITER, ",");
    const axiom = parseAxiom(parser);
    match(parser, DELIMITER, ",");
    const productions = parseProductions(parser);
    let ignore = []
    if (lookAhead(parser, DELIMITER, ",")) {
        match(parser, DELIMITER, ",");
        ignore = parseIgnore(parser);
    }
    match(parser, BRACKET_CLOSE, ")");
    const lsystem = new LSystem(alphabet, axiom, productions, ignore);
    return lsystem;
}

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
     * @returns {LSystem}
     */
    parse(input) {
        _lexer.set(this, new Lexer(input));
        _idTable.set(this, []);
        return parseLSystem(this);
    }
};

export {
    Parser,
    CONTEXT,
    MODULE_NAME
};
