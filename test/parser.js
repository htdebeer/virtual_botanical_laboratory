const assert = require('assert');
const lab = require('../dist/node-lab.js');

describe('Parser', function () {
    describe('parse()', function () {

        const minimal = `lsystem(  
            alphabet: {A, B, C},
            axiom: A,
            productions: {
            }
        )`;

        it(`should match "${minimal}"`, function () {
            const parser = new lab.Parser();
            let lsystem;
            assert.doesNotThrow(() => lsystem = parser.parse(minimal));
            assert.doesNotThrow(() => lsystem = parser.parse(lsystem.stringify()));
        });

        const simple = `lsystem (
            alphabet: {A, B, C},
            axiom: A C,
            productions: {
                A -> A B B A,
                B -> B A A B,
                C -> C
            }
        )`;
        
        it(`should match "${simple}"`, function () {
            const parser = new lab.Parser();
            let lsystem;
            assert.doesNotThrow(() => lsystem = parser.parse(simple));
            assert.doesNotThrow(() => lsystem = parser.parse(lsystem.stringify()));
        });

        const simpleTree = `lsystem (
            alphabet: {A, B, C},
            axiom: A,
            productions: {
                A -> A [A B] B A,
                B -> B [A [A] B],
                C -> C
            }
        )`;
        
        it(`should match "${simpleTree}"`, function () {
            const parser = new lab.Parser();
            let lsystem;
            assert.doesNotThrow(() => lsystem = parser.parse(simpleTree));
            assert.doesNotThrow(() => lsystem = parser.parse(lsystem.stringify()));
        });

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
        
        it(`should match "${simpleStochastic}"`, function () {
            const parser = new lab.Parser();
            let lsystem;
            assert.doesNotThrow(() => lsystem = parser.parse(simpleStochastic));
            assert.doesNotThrow(() => lsystem = parser.parse(lsystem.stringify()));
        });

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
        
        it(`should match "${simpleStochasticTree}"`, function () {
            const parser = new lab.Parser();
            let lsystem;
            assert.doesNotThrow(() => lsystem = parser.parse(simpleStochasticTree));
            assert.doesNotThrow(() => lsystem = parser.parse(lsystem.stringify()));
        });

        const simpleContext = `lsystem (
            alphabet: {A, B, C},
            axiom: A,
            productions: {
                A -> A B B A,
                A <B -> B A A B,
                B <C >B -> C
            }
        )`;
        
        it(`should match "${simpleContext}"`, function () {
            const parser = new lab.Parser();
            let lsystem;
            assert.doesNotThrow(() => lsystem = parser.parse(simpleContext));
            assert.doesNotThrow(() => lsystem = parser.parse(lsystem.stringify()));
        });

        const simpleParameterized = `lsystem (
            alphabet: {A(t), B, C(p, q)},
            axiom: A(0),
            productions: {
                A(t) -> A(t+1) B B A(t-1),
                B -> B A(0) A(10) B,
                C(p, q) -> C(p - 1, q * 2)
            }
        )`;
        
        it(`should match "${simpleParameterized}"`, function () {
            const parser = new lab.Parser();
            let lsystem;
            lsystem = parser.parse(simpleParameterized);
            assert.doesNotThrow(() => lsystem = parser.parse(simpleParameterized));
            assert.doesNotThrow(() => lsystem = parser.parse(lsystem.stringify()));
        });

        const simpleConditionalParameterized = `lsystem (
            alphabet: {A(t), B, C(p, q)},
            axiom: A(0),
            productions: {
                A(t) : t > 0 or (not t > 2) -> A(t+1) B B A(t-1),
                B -> B A(0) A(10) B,
                C(p, q): p > 5 and q < 5 -> C(p - 1, q * 2)
            }
        )`;
        
        it(`should match "${simpleConditionalParameterized}"`, function () {
            const parser = new lab.Parser();
            let lsystem;
            assert.doesNotThrow(() => lsystem = parser.parse(simpleConditionalParameterized));
            assert.doesNotThrow(() => lsystem = parser.parse(lsystem.stringify()));
        });



    });
});

