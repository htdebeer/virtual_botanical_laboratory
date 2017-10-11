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
const _name = new WeakMap();
const _lexeme = new WeakMap();
const _value = new WeakMap();
const _column = new WeakMap();
const _line = new WeakMap();
const _lexemeBegin = new WeakMap();

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
        _name.set(this, name);
        _lexeme.set(this, lexeme);
        _value.set(this, value);
        _line.set(this, line);
        _column.set(this, column);
        _lexemeBegin.set(this, lexemeBegin);
    }

    get name() {
        return _name.get(this);
    }
    
    get lexeme() {
        return _lexeme.get(this);
    }

    get value() {
        return _value.get(this);
    }

    get line() {
        return _line.get(this);
    }

    get column() {
        return _column.get(this);
    }

    get lexemeBegin() {
        return _lexemeBegin.get(this);
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

export {
    Token
};
