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
import {LexicalError} from './LexicalError.js';
import {Token} from './Token.js';
import {CONTEXT, MODULE_NAME} from './Parser.js';

// Token names

const NUMBER = Symbol('NUMBER');
const IDENTIFIER = Symbol('IDENTIFIER');
const BRACKET_OPEN = Symbol('BRACKET_OPEN');
const BRACKET_CLOSE = Symbol('BRACKET_CLOSE');
const OPERATOR = Symbol('OPERATOR');
const DELIMITER = Symbol('DELIMITER');
const KEYWORD = Symbol('KEYWORD');

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
        if ('\n' === c) {
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

const recognize  = function (lexer, tokenName, value) {
    const token = new Token(
        tokenName, 
        lexeme(lexer), 
        value, 
        line(lexer), 
        column(lexer) - lexeme(lexer).length,
        _lexemeBegin.get(this)
    );

    _lexemeBegin.set(lexer, _forward.get(lexer) + 1);
    _forward.set(lexer, _forward.get(lexer));

    return token;
}

const position = function (lexer) {
    return `(${line(lexer)}, ${column(lexer) - (_forward.get(lexer) - _lexemeBegin.get(lexer))})`;
};

// Recognize patterns

const isWhitespace = function (c) {
    return [' ', '\t', '\n'].includes(c);
};

const isCommentStart = function (c) {
    return '#' === c;
};

const isDigit = function (c) {
    return '0' <= c && c <= '9';
};

const isLetter = function (c) {
    return ('a' <= c && c <= 'z') || ('A' <= c && c <= 'Z');
};

const isIdentifierExtra = function (c) {
    return [
        "'",
        "_"
    ].includes(c);
};

const isKeyword = function (identifier) {
    return [
        'lsystem',
        'alphabet',
        'axiom',
        'productions',
        'ignore',
        'include',
        'and',
        'or',
        'not',
        'true',
        'false'
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

const skipWhitespace = function (lexer) {
    while (isWhitespace(peek(lexer))) {
        moveForward(lexer, true);
    }
};

const skipComment = function (lexer) {
    if (isCommentStart(peek(lexer))) {
        while ('\n' !== peek(lexer)) {
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
        if ('.' === peek(lexer) && isDigit(peek(lexer, 2))) {
            moveForward(lexer);
            digits(lexer);
        }

        // Exponent part
        if (['e', 'E'].includes(peek(lexer))) {
            moveForward(lexer);

            if (['+', '-'].includes(peek(lexer))) {
                moveForward(lexer);
            }

            if (!isDigit(peek(lexer))) {
                throw new LexicalError(`Expected a numerical exponential part at ${position(lexer)}, got '${peek(lexer)}' instead.`);
            }

            digits(lexer);
        }

        try {
            const value = parseFloat(lexeme(lexer));
            return recognize(lexer, NUMBER, value);        
        } catch (e) {
            throw new LexicalError(`Unable to parse '${lexeme(lexer)}' as a number at ${position(lexer)}.`);
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
    const BRACKET_OPEN_CHARACTERS = ['(', '{', '['];
    const BRACKET_CLOSE_CHARACTERS = [')', '}', ']'];

    if (isContext(lexer, CONTEXT)) {
        BRACKET_OPEN_CHARACTERS.push("<");
        BRACKET_CLOSE_CHARACTERS.push(">");
    };

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
    if ([',', ':', ";"].includes(c)) {
        moveForward(lexer);
        return recognize(lexer, DELIMITER, c);
    }
};

const operator = function (lexer) {
    const c = peek(lexer);
    if (['-', '+', '*', '/', '^', '>', '<', '='].includes(c)) {
        if ('-' === c) {
            moveForward(lexer);
            if ('>' === peek(lexer)) {
                moveForward(lexer);
            }
        } else if ('<' === c) {
            moveForward(lexer);
            if ('=' === peek(lexer) || '>' === peek(lexer)) {
                moveForward(lexer);
            }
        } else if ('>' === c) {
            moveForward(lexer);
            if ('=' === peek(lexer)) {
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
    constructor(input = '') {
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
            )

            const token =
                identifier(this) ||
                number(this) ||
                bracket(this) ||
                delimiter(this) ||
                operator(this)
            ;

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

};

export {
    Lexer,
    NUMBER,
    IDENTIFIER,
    BRACKET_OPEN,
    BRACKET_CLOSE,
    OPERATOR,
    DELIMITER,
    KEYWORD
};
