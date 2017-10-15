const assert = require("assert");
const lab = require("../dist/node-lab.js");

const recognizeAllOfType = function (strings, type, toValue = (s) => s) {
    for (const string of strings) {
        const lexer = new lab.Lexer(string);
        const tok = lexer.getNextToken();
        assert.equal(type, tok.name);
        const value = lab.STRING === type ? `"${tok.value}"` : tok.value;
        assert.equal(toValue(string), value);
        assert.equal(string, tok.lexeme);
        assert.equal(0, tok.line);
        assert.equal(0, tok.column);
    }
};

const recognizeTheFollowingTokensInString = function (string, expectedTokens) {
    const lexer = new lab.Lexer(string);
    let token;
    const foundTokens = [];
    while (token = lexer.getNextToken()) {
        foundTokens.push(token);
    }

    assert.equal(expectedTokens.length, foundTokens.length);
    for(let i = 0; i < expectedTokens.length; i++) {
        assert.equal(expectedTokens[i], foundTokens[i].name);
    }
};

describe('Lexer', function () {
    describe('getNextToken()', function () {

        const STRINGS = ["\"this is a string\"", "\"\"", "\"a \nmultiline\nstring\""];
        it(`should return a string token when analyzing any of: ${STRINGS.join(" ")}`, function () {
            recognizeAllOfType(STRINGS, lab.STRING);
        });

        const IDS = ["aname", "A", "aname2", "a2naME"];
        it(`should return an identifier token when analyzing any of: ${IDS.join(" ")}`, function () {
            recognizeAllOfType(IDS, lab.IDENTIFIER);
        });

        const KEYWORDS = ["lsystem", "alphabet", "axiom", "productions", "ignore", "include", "and", "or", "not", "true", "false"];
        it(`should return a keyword token when analyzing any of: ${KEYWORDS.join(" ")}`, function () {
            recognizeAllOfType(KEYWORDS, lab.KEYWORD);
        });

        const NUMBERS = ["45.6", "5", "67.0003", "4.87e-10", "0", "2432.4"];
        it(`should return a number token when analyzing any of: ${NUMBERS.join(" ")}`, function () {
            recognizeAllOfType(NUMBERS, lab.NUMBER, (n) => parseFloat(n));
        });

        const BRACKETS_OPEN = ["(", "[", "{"];
        it(`should return a bracket_open token when analyzing any of: ${BRACKETS_OPEN.join(" ")}`, function () {
            recognizeAllOfType(BRACKETS_OPEN, lab.BRACKET_OPEN);
        });
        
        const BRACKETS_CLOSE = [")", "]", "}"];
        it(`should return a bracket_close token when analyzing any of: ${BRACKETS_CLOSE.join(" ")}`, function () {
            recognizeAllOfType(BRACKETS_CLOSE, lab.BRACKET_CLOSE);
        });

        const OPERATORS = ["-", "+", "*", "/", "^", "->", ">", "<", ">=", "<=", "=", "<>"];
        it(`should return an operator token when analyzing any of: ${OPERATORS.join(" ")}`, function () {
            recognizeAllOfType(OPERATORS, lab.OPERATOR);
        });

        const DELIMITERS = [",", ":"];
        it(`should return a delimiter token when analyzing any of: ${DELIMITERS.join(" ")}`, function () {
            recognizeAllOfType(DELIMITERS, lab.DELIMITER);
        });

    });

    describe("lookAhead()", function () {
        it(`should see '+' after recognizing 'a' in 'a + b'`, function () {
            const lexer = new lab.Lexer("a + b");
            let token = lexer.getNextToken();
            assert.equal(lab.IDENTIFIER, token.name);
            assert.equal("a", token.value);
            token = lexer.lookAhead();
            assert.equal(lab.OPERATOR, token.name);
            assert.equal("+", token.value);
            token = lexer.getNextToken();
            assert.equal(lab.OPERATOR, token.name);
            assert.equal("+", token.value);
            assert.equal(2, token.column);
        });
        it(`should see 'b' in 'a + b' with look ahead distance 3`, function () {
            const lexer = new lab.Lexer("a + b");
            let token = lexer.lookAhead(3);
            assert.equal(lab.IDENTIFIER, token.name);
            assert.equal("b", token.value);
            assert.equal(4, token.column);
            token = lexer.getNextToken();
            assert.equal(lab.IDENTIFIER, token.name);
            assert.equal("a", token.value);
            assert.equal(0, token.column);
        });
    });

    const simpleExpressionString = "a + b = c";

    it(`should analyze '${simpleExpressionString}' into the tokens id(a) op(+) id(b) op(=) id(c)`, function () {
        const lexer = new lab.Lexer(simpleExpressionString);
        const tokens = [];
        let token;
        
        while (token = lexer.getNextToken()) {
            tokens.push(token);
        }

        assert.equal(5, tokens.length);

        assert.equal(lab.IDENTIFIER, tokens[0].name);
        assert.equal("a", tokens[0].value);
        assert.equal("a", tokens[0].lexeme);
        assert.equal(0, tokens[0].line);
        assert.equal(0, tokens[0].column);

        assert.equal(lab.OPERATOR, tokens[1].name);
        assert.equal("+", tokens[1].value);
        assert.equal("+", tokens[1].lexeme);
        assert.equal(0, tokens[1].line);
        assert.equal(2, tokens[1].column);

        assert.equal(lab.IDENTIFIER, tokens[2].name);
        assert.equal("b", tokens[2].value);
        assert.equal("b", tokens[2].lexeme);
        assert.equal(0, tokens[2].line);
        assert.equal(4, tokens[2].column);

        assert.equal(lab.OPERATOR, tokens[3].name);
        assert.equal("=", tokens[3].value);
        assert.equal("=", tokens[3].lexeme);
        assert.equal(0, tokens[3].line);
        assert.equal(6, tokens[3].column);

        assert.equal(lab.IDENTIFIER, tokens[4].name);
        assert.equal("c", tokens[4].value);
        assert.equal("c", tokens[4].lexeme);
        assert.equal(0, tokens[4].line);
        assert.equal(8, tokens[4].column);

    });
    
    const simpleExpressionStringWithNewLines = "a\n +\n b =\nc";

    it(`should analyze '${simpleExpressionStringWithNewLines}' into the tokens id(a) op(+) id(b) op(=) id(c)`, function () {
        const lexer = new lab.Lexer(simpleExpressionStringWithNewLines);
        const tokens = [];
        let token;
        
        while (token = lexer.getNextToken()) {
            tokens.push(token);
        }

        assert.equal(5, tokens.length);

        assert.equal(lab.IDENTIFIER, tokens[0].name);
        assert.equal("a", tokens[0].value);
        assert.equal("a", tokens[0].lexeme);
        assert.equal(0, tokens[0].line);
        assert.equal(0, tokens[0].column);

        assert.equal(lab.OPERATOR, tokens[1].name);
        assert.equal("+", tokens[1].value);
        assert.equal("+", tokens[1].lexeme);
        assert.equal(1, tokens[1].line);
        assert.equal(1, tokens[1].column);

        assert.equal(lab.IDENTIFIER, tokens[2].name);
        assert.equal("b", tokens[2].value);
        assert.equal("b", tokens[2].lexeme);
        assert.equal(2, tokens[2].line);
        assert.equal(1, tokens[2].column);

        assert.equal(lab.OPERATOR, tokens[3].name);
        assert.equal("=", tokens[3].value);
        assert.equal("=", tokens[3].lexeme);
        assert.equal(2, tokens[3].line);
        assert.equal(3, tokens[3].column);

        assert.equal(lab.IDENTIFIER, tokens[4].name);
        assert.equal("c", tokens[4].value);
        assert.equal("c", tokens[4].lexeme);
        assert.equal(3, tokens[4].line);
        assert.equal(0, tokens[4].column);

    });

    
    it(`should recognize "lsystem(axion"`, function () {
        const input = "lsystem(axiom";
        const recognizedTokens = [lab.KEYWORD, lab.BRACKET_OPEN, lab.KEYWORD];

        recognizeTheFollowingTokensInString(input, recognizedTokens);
    });
    
    it(`should recognize all tokens in an lsystem specification`, function () {
        const input = `
        lsystem(
            alphabet: {
                A,
                B,
                C
            },
            axiom: A,
            productions: {
                A -> A B B A,
                B -> A B B C
            }
        )
            
        `;
        const recognizedTokens = [
            lab.KEYWORD, 
            lab.BRACKET_OPEN, 
            lab.KEYWORD,
            lab.DELIMITER,
            lab.BRACKET_OPEN,
            lab.IDENTIFIER,
            lab.DELIMITER,
            lab.IDENTIFIER,
            lab.DELIMITER,
            lab.IDENTIFIER,
            lab.BRACKET_CLOSE,
            lab.DELIMITER,
            lab.KEYWORD,
            lab.DELIMITER,
            lab.IDENTIFIER,
            lab.DELIMITER,
            lab.KEYWORD,
            lab.DELIMITER,
            lab.BRACKET_OPEN,
            lab.IDENTIFIER,
            lab.OPERATOR,
            lab.IDENTIFIER,
            lab.IDENTIFIER,
            lab.IDENTIFIER,
            lab.IDENTIFIER,
            lab.DELIMITER,
            lab.IDENTIFIER,
            lab.OPERATOR,
            lab.IDENTIFIER,
            lab.IDENTIFIER,
            lab.IDENTIFIER,
            lab.IDENTIFIER,
            lab.BRACKET_CLOSE,
            lab.BRACKET_CLOSE
        ];

        recognizeTheFollowingTokensInString(input, recognizedTokens);
    });
});

