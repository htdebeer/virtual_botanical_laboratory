---
author: Huub de Beer
date: October 2017
keywords:
- 'l-system'
- turtle interpretation
- generate plants
- JavaScript
title: Virtual botanical laboratory
---

Introduction
============

A while back I was reading *Artificial life. A report from the frontier
where computers meet biology* [@Levy1992a]. In this book, Levy describes
the development of the scientific field of *artificial life* till the
1990s. Although I think the book was less readable than his work
*Hackers* [@Levy2010a], it was still an interesting read. What piqued my
interest most in Levy's book on artificial life was the idea of
generating plant-like structures by means of a rewriting system known as
an *[L-system](https://en.wikipedia.org/wiki/L-system)*.

In the notes to the Chapter *Artificial flora, artifical fauna,
artificial ecologies* I found a reference to a book called *The
algorithmic beauty of plants* [@Prusinkiewicz1990a]. Given its age, I
had little hope in finding this book. To my surprise, it is available
[on-line](http://algorithmicbotany.org/papers/abop/abop.pdf)! (Warning,
this is a 17Mb PDF; see <http://algorithmicbotany.org/papers/#abop> for
smaller versions.)

I downloaded the book and started reading it. Chapter 1 is introductory
material introducing the L-system formalism, its extensions, and a way
to render these L-systems. The authors render the L-systems by
interpreting it in terms of [turtle
graphics](https://en.wikipedia.org/wiki/Turtle_graphics). Turtle
graphics is quite a simple way of thinking about drawing things with a
computer: given a turtle holding a pen, tell the turtle where to move,
to rotate, and to push the pen to the paper or not.

Seeing the turtle interpretation, I tried to read [@Prusinkiewicz1990a]
using a [constructionist
approach](https://en.wikipedia.org/wiki/Constructionism_(learning_theory))
by building the examples myself. After a couple of fun hours programming
these prototypes, I decided to write my own virtual botanical laboratory
because I assumed that the software described in *The algorithmic beauty
of plants* would not exist anymore. Later, when I had finished most of
the engine of my virtual botanical laboratory, I discovered that the
group who put the book on-line also have put their
[software](http://algorithmicbotany.org/virtual_laboratory/) on-line as
well.

![How much fun: I generated an odd looking
tree!](images/generated_tree.png)

Then again, building my own laboratory probably deepened my
understanding of the material I would not have reached by using the
available software. Here I present my own virtual botanical laboratory
that I unoriginally named `virtual_botanical_laboratory`. Feel free to
use is to explore the book *The algorithmic beauty of plants* yourself,
use it to generate your own plant-like shapes, or just have fun with it!
(For example, look at that odd looking tree I generated above :-))

In the [next Chapter](#reading), the `virtual_botanical_laboratory` is
introduced by enumerating the examples from Chapter 1 of *The
algorithmic beauty of plants* defined in the
`virtual_botanical_laboratory`. After that introduction, the [use of the
software](#using%7D%20is%20detailed%20in%20two%20steps:%201) a
description of the [user interface](#interface), followed by 2) an
overview of the [L-system language](#l-system). Finally, [building the
software](#developing) is discussed, including a list with [to do
items](#todo).

Running the `virtual_botanical_laboratory` {\#running
-----------------------------------------------------

To run the `virtual_botanical_laboratory`, you need to:

-   include `dist/virtual_botanical_laboratory.js` in your HTML file.
    For example in the HEAD like:

    ``` {.html}
    <!DOCTYPE html>
    <html>
        <head>
            <script src="dist/virtual_botanical_laboratory.js"></script>
    ```

-   create a LabView and configure it. For example:

    ``` {.html}
    <figure id="lab"></figure>
    <script>
        new virtual_botanical_laboratory.LabView("#lab", {
            lsystem: `simple_tree = lsystem(
                description: "Simple growing tree",
                alphabet: {F, O, I, -, +},
                axiom: F I F I F I,
                productions: {
                    O < O > O -> I,
                    O < O > I -> I [ - F I F I ],
                    O < I > O -> I,
                    O < I > I -> I,
                    I < O > O -> O,
                    I < O > I -> I F I,
                    I < I > O -> I,
                    I < I > I -> O,
                    + -> -,
                    - -> +
                },
                ignore: {+, -, F}
            )`,
            interpretation: {
                config: {
                    x: 200,
                    y: 300,
                    width: 600,
                    height: 400,
                    d: 10,
                    delta: (-22.5 * Math.PI)/180,
                    alpha: (270 * Math.PI)/180,
                    close: false,
                    derivationLength: 10,
                    animate: false
                }
            }
        });
    </script>
    ```

-   and
    [open](https://heerdebeer.org/Software/virtual_botanical_laboratory/examples/example-labview.html)
    the HTML file in a modern web browser!

For more examples, please see the
[examples](https://heerdebeer.org/Software/virtual_botanical_laboratory/#reading).

For more information about creating and configuring L-systems, see the
chapters below.

License
-------

`virtual_botanical_laboratory` is [free
software](https://www.gnu.org/philosophy/free-sw.en.html);
`virtual_botanical_laboratory` is released under the
[GPLv3](https://www.gnu.org/licenses/gpl-3.0.en.html). You find
`virtual_botanical_laboratory`'s source code on
[github](https://github.com/htdebeer/virtual_botanical_laboratory).

Reading *The algorithmic beauty of plants* {#reading}
==========================================

In this Chapter all examples in the first Chapter of the book *The
algorithmic beauty of plants*, **Graphical modeling using L-systems**,
are recreated using the `virtual_botanical_laboratory`. I recommend you
read the book's chapter while exploring the examples. In doing so, you
will get familiar with the syntax of defining a L-system.

Note. Sometimes doing another derivation might crash your browser.

-   Figure 1.6: Generating a quadratic Koch island [@Prusinkiewicz1990a,
    p.8]

    ![The Koch island with a derivation of length 3; [click to open
    example in the
    `virtual_botanical_laboratory`](examples/tabop/c1/figure1.6.html)](images/tabop/c1/figure1.6.png)

-   Figure 1.7: Examples of Koch curves generated using L-systems
    [@Prusinkiewicz1990a, p.9]

    -   ![Figure 1.7.a. Quadratic Koch island [click to open example in
        the
        `virtual_botanical_laboratory`](examples/tabop/c1/figure1.7.a.html)](images/tabop/c1/figure1.7.a.png)

    -   ![Figure 1.7.b. A quadratic modification of the snowflake curve
        [click to open example in the
        `virtual_botanical_laboratory`](examples/tabop/c1/figure1.7.b.html)](images/tabop/c1/figure1.7.b.png)

-   Figure 1.8: Combination of islands and lakes [@Prusinkiewicz1990a,
    p.9]

    ![Figure 1.8. Combination of islands and lakes [click to open
    example in the
    `virtual_botanical_laboratory`](examples/tabop/c1/figure1.8.html)](images/tabop/c1/figure1.8.png)

-   Figure 1.9: A sequence of Koch curves obtained by successive
    modification of the production successor [@Prusinkiewicz1990a, p.10]

    -   ![Figure 1.9.a: F → FF-F-F-F-F-F+F [click to open example in the
        `virtual_botanical_laboratory`](examples/tabop/c1/figure1.9.a.html)](images/tabop/c1/figure1.9.a.png)

    -   ![Figure 1.9.b: F → FF-F-F-F-FF [click to open example in the
        `virtual_botanical_laboratory`](examples/tabop/c1/figure1.9.b.html)](images/tabop/c1/figure1.9.b.png)

    -   ![Figure 1.9.c: F → FF-F+F-F-FF [click to open example in the
        `virtual_botanical_laboratory`](examples/tabop/c1/figure1.9.c.html)](images/tabop/c1/figure1.9.c.png)

    -   ![Figure 1.9.d: F → FF-F--F-F [click to open example in the
        `virtual_botanical_laboratory`](examples/tabop/c1/figure1.9.d.html)](images/tabop/c1/figure1.9.d.png)

    -   ![Figure 1.9.e: F → F-FF--F-F [click to open example in the
        `virtual_botanical_laboratory`](examples/tabop/c1/figure1.9.e.html)](images/tabop/c1/figure1.9.e.png)

    -   ![Figure 1.9.f: F → F-F+F-F-F [click to open example in the
        `virtual_botanical_laboratory`](examples/tabop/c1/figure1.9.f.html)](images/tabop/c1/figure1.9.f.png)

Using the virtual botanical laboratory {#using}
======================================

Interface
---------

to do

The L-system language {#l-system}
---------------------

to do

Developing `virtual_botanical_laboratory` {#developing}
=========================================

If you plan on extending or adapting the `virtual_botanical_laboratory`,
see the [API
documentation](https://heerdebeer.org/Software/virtual_botanical_laboratory/documentation/api/).

Building
--------

-   To build the `virtual_botanical_laboratory`, run

    ``` {.bash}
    npm install
    npm run build
    ```

-   To generate the API documentation, run

    ``` {.bash}
    npm run doc
    ```

-   To generate the manual you need
    [pandocomatic](https://heerdebeer.org/Software/markdown/pandocomatic/)
    and [Bash](https://www.gnu.org/software/bash/), run

    ``` {.bash}
    ./generate_documentation.sh
    ```

Todo
----

The `virtual_botanical_laboratory` is still a work in progress. With the
current version you can explore much of the material in the book *The
algorithmic beauty of plants* [@Prusinkiewicz1990a]. Some more advanced
features from later in that book needs to be implemented still.

The following list of features and improvements are still to do:

-   **L-system language**:
    -   **Import**ing other l-systems
    -   **`&`** operator
    -   Other stuff from later in the book
-   **Interpretation**:
    -   Rendering **3D** interpretations
-   An **improved user interface**. The current interface is just a
    placeholder. Enough to configure and experiment with l-systems, but
    in not user-friendly. Feel free to replace it with something better,
    pull requests are welcome!

References
==========

---
pandocomatic_:
    pandoc:
        bibliography: './documentation/data-dir/bibliography.bib'
        csl: './documentation/data-dir/apa.csl'
        filter:
        - './documentation/data-dir/number_all_the_things.rb'
...
