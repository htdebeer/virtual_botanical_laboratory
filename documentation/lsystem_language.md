The language to define a L-system follows the language described in the (first
chapter of the) book
*The algorithmic beauty of plants* [@Prusinkiewicz1990a]. There are some
notable differences:

1.  Symbol names should be separated from each other. If you want to denote an
    `F` followed by another `F`, write `F F` rather than `FF`.
2.  Symbols can have names of any length larger than 0. So you can use symbol
    `Forward` instead of `F` if you so please.
3.  3D aspects of the language have not yet been implemented.
4.  Language features described outside of Chapter 1 of @Prusinkiewicz1990a
    have not yet been implemented.

Next the features of the L-system definition language are briefly introduced.
For a more thorough overview, please see the [Chapter on reading
@Prusinkiewicz1990a](#reading). 

### Basic L-system definitions

A basic L-system is defined by three parts:

1.  An **alphabet** with symbols, such as `F`, `-`, and `+`.
2.  The **axiom** or the initial string of symbols, such as `F F`.
3.  A list of rewriting rules called **productions**, such as `F -> - F + F`.

You specify the above L-system as follows:

```{.lsystem}
my_first_lsystem = lsystem(
    alphabet: {F, -, +},
    axiom: F F,
    productions: {
        F -> - F + F,
        - -> -,
        + -> +
    }
)
```

Identity rewriting rules like `+ -> +` can be omitted. If there is no
rewriting rule specified for a symbol in the language, the identity rewriting
rule is used by default.

For documenting purposes, you can also add a **description** to the L-system
definition. So, the above example can be rewritten as:

```{.lsystem}
my_first_lsystem = lsystem(
    description: "This is my first L-system definition!",
    alphabet: {F, -, +},
    axiom: F F,
    productions: {
        F -> - F + F
    }
)
```

One of the interesting features of L-systems are branching structures. To
define a sub structure, place it in between `[` and `]`. For example:

```{.lsystem}
expanding_tree_circle = lsystem(
    alphabet: {F, -, +},
    axiom: F,
    productions: {
        F -> F [ + F] - F
    }
)
```

This will generate some expanding circle of branching lines.


### Extensions to the L-system definition language

-   Stochastic L-systems. To bring some randomness into your generated plants,
    you can configure different successor patterns for one symbol and indicate
    the likelyhood these successor patterns are chosen by prepending each
    successor pattern with a
    numerical probability. The sum of these probabilities **must** be one (1).

    For example, in the previous example you can choose circling left over
    right more often as follows:

    ```{.lsystem}
    expanding_random_tree_circle = lsystem(
        alphabet: {F, -, +},
        axiom: F,
        productions: {
            F: {
                0.4 -> F [ + F] - F,
                0.6 -> F [ - F] + F
            }
        }
    )

    ```

-   Context-aware L-system. You can choose a different successor pattern
    depending on the context wherein a symbol appears. For example, a `F`
    after a `+` can be replaced by a `f + F`, and a `F` after a `-` can be
    replaced by a `F - f`. You can indicate which symbols should be
    ignored when checking the context using the **ignore** keyword. For
    example:
    

    ```{.lsystem}
    expanding_random_tree_circle = lsystem(
        alphabet: {F, f, -, +},
        axiom: f,
        productions: {
            - < F -> F - f,
            + < F -> f + F.
            f -> f [ - F] f [+ f]
        },
        ignore: {f}
    )

    ```

    The *left context* is indicated by the string before the `<` operator. You
    can indicate the *right context* by a string after the `>` operator (not
    shown in the example).
     
-   Parameterized symbols. To move information through a derivation, you can
    user parameterized symbols. For example:
    

    ```{.lsystem}
    dx = 10;
    ddx = 0.5;

    expanding_random_tree_circle = lsystem(
        alphabet: {F'(x), -, +},
        axiom: F'(100),
        productions: {
            F'(x): x > 100 -> F + [ F'(x - dx) - F'(x / ddx)],
            F'(x): x < 100 -> F - [ F'(x + dx) - F'(x * ddx)]
        }
    )

    ```

    Here the `F'` symbol has parameter `x`. The successor to `F'(x)` differs
    depending on the value of `x`. These rewriting rules are *conditional*.
    You can define symbols with one or more parameters. Conditions can be
    complex by using Boolean operators `and`, `or`, and `not`. 

    Also note the definition of global values `dx` and `ddx`.

    The power of parameterization is realized best by making using the
    parameter in the interpretation to change the behavior of the commands.
    For example, we can define the `F'` command as follows:

    ```
    this.d = this.d + x;
    this.getCommand("F").execute(this);
    ```

