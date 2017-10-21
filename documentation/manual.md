---
title: Virtual botanical laboratory
author: Huub de Beer
date: October 2017
keywords:
-   l-system
-   turtle interpretation
-   generate plants
-   JavaScript
pandocomatic_:
    use-template: indexdoc
...

# Introduction {#introduction}

::paru::insert introduction.md

In the [next Chapter](#reading), the `virtual_botanical_laboratory` is
introduced by enumerating the examples from Chapter 1 of *The algorithmic
beauty of plants* defined in the `virtual_botanical_laboratory`. After that
introduction, the [use of the software](#using} is detailed in two steps: 1) a
description of the [user interface](#interface), followed by 2) an overview of
the [L-system language](#l-system). Finally, [building the
software](#developing) is discussed, including a list with [to do
items](#todo).

## Example

<script src="dist/virtual_botanical_laboratory.js"></script>
<figure id="lab">
<figcaption>
A simple growing weed of sorts. From: Prusinkiewicz and Lindenmayer (1990) *The Algorithmic Beauty of Plants*, p.25, Figure 1.24
</figcaption>
</figure>
<script>
new virtual_botanical_laboratory.LabView("#lab", {
lsystem: `simple_weed = lsystem(
    description: "Simple growing weed.",
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
        y: 500,
        width: 600,
        height: 500,
        d: 10,
        delta: (-22.5 * Math.PI)/180,
        alpha: (270 * Math.PI)/180,
        close: false,
        derivationLength: 24,
        animate: false,
        "line-width": 2,
        "line-color": "#4E9C25"
    }
}
});
</script>

How to run this example on your own is explained in the next section.

## Running the `virtual_botanical_laboratory` {#running}

::paru::insert running.md

For more information about creating and configuring L-systems, see the
chapters below.

## License

::paru::insert license.md

# Reading *The algorithmic beauty of plants* {#reading}

::paru::insert reading.md

# Using the virtual botanical laboratory {#using}

## Interface {#interface}

::paru::insert interface.md

## The L-system language  {#l-system}

::paru::insert lsystem_language.md

# Developing `virtual_botanical_laboratory` {#developing}

::paru::insert development.md

# References
