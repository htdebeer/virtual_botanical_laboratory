const assert = require('assert');
const lab = require('../dist/node-lab.js');
const parser = new lab.Parser();

const parse = function (str) {
    let strToParse = str;
    let lsystem;
    
    try {
        lsystem = parser.parse(strToParse);
        console.log(lsystem.stringify(), lsystem.globalContext);
    } catch (e) {
        console.log(`ERROR occurred: `, e);
    }

    assert.doesNotThrow(() => {
        lsystem = parser.parse(strToParse);
        strToParse = lsystem.stringify();
    });

    try {
        parser.parse(strToParse);
    } catch (e) {
        console.log(`ERROR occurred ls: `, e);
    }

    assert.doesNotThrow(() => {
        lsystem = parser.parse(strToParse);
    });
};

describe('Parser', function () {
    describe('parse()', function () {

        const minimal = `lsystem(  
            alphabet: {A, B, C},
            axiom: A,
            productions: {
            }
        )`;

        it(`should match "${minimal}"`, () => parse(minimal));

        const simple = `lsystem (
            alphabet: {A, B, C},
            axiom: A C,
            productions: {
                A -> A B B A,
                B -> B A A B,
                C -> C
            }
        )`;
        
        it(`should match "${simple}"`,() => parse(simple));

        const simpleTree = `lsystem (
            alphabet: {A, B, C},
            axiom: A,
            productions: {
                A -> A [A B] B A,
                B -> B [A [A] B],
                C -> C
            }
        )`;
        
        it(`should match "${simpleTree}"`, () => parse(simpleTree));

        const simpleStochastic = `lsystem (
            alphabet: {A, B, C},
            axiom: A,
            productions: {
                A : {
                    0.3 -> A B B A,
                    0.7 -> C
                },
                B -> B A A B,
                C: {
                    0.4 -> C,
                    0.1 -> B B,
                    0.5 -> C B C
                }
            }
        )`;
        
        it(`should match "${simpleStochastic}"`, () => parse(simpleStochastic));

        const simpleStochasticTree = `lsystem (
            alphabet: {A, B, C},
            axiom: A,
            productions: {
                A : {
                    0.3 -> A [B [B] A ],
                    0.7 -> C
                },
                B -> B A A B,
                C: {
                    0.4 -> C,
                    0.1 -> B [B],
                    0.5 -> C B C
                }
            }
        )`;
        
        it(`should match "${simpleStochasticTree}"`, () => parse(simpleStochasticTree));

        const simpleContext = `lsystem (
            alphabet: {A, B, C},
            axiom: A,
            productions: {
                A -> A B B A,
                A <B -> B A A B,
                B <C >B -> C
            }
        )`;
        
        it(`should match "${simpleContext}"`, () => parse(simpleContext));

        const simpleParameterized = `lsystem (
            alphabet: {A(t), B, C(p, q)},
            axiom: A(0),
            productions: {
                A(t) -> A(t+1) B B A(t-1),
                B -> B A(0) A(10) B,
                C(p, q) -> C(p - 1, q * 2)
            },
            ignore: {B}
        )`;
        
        it(`should match "${simpleParameterized}"`, () => parse(simpleParameterized));

        const simpleConditionalParameterized = `lsystem (
            alphabet: {A(t), B, C(p, q)},
            axiom: A(0),
            productions: {
                A(t) : t > 0 or (not t > 2) -> A(t+1) B B A(t-1),
                B -> B A(0) A(10) B,
                C(p, q): p > 5 and q < 5 -> C(p - 1, q * (p * 2) + 4)
            }
        )`;
        
        it(`should match "${simpleConditionalParameterized}"`, () => parse(simpleConditionalParameterized));

        const minimalWithConstants = `
        A = 3;
        B = (A * 2) / A;

        lsystem(  
            alphabet: {A, B, C},
            axiom: A,
            productions: {
            }
        )`;

        it(`should match "${minimalWithConstants}"`, () => parse(minimalWithConstants));


    });
});

