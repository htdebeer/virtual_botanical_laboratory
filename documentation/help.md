---
title: Help—Virtual botanical laboratory
pandocomatic_:
    pandoc:
        from: "markdown"
        to: "html5"
        filter: 
        - "insert_document.rb"
        - "insert_code_block.rb"
        bibliography: bibliography.bib
        cls: apa.csl
    postprocessors: ["create_js_help.rb"]
...

This is a short manual of how to use the `virtual_botanical_laboratory`. For
more information see the
[website](https://heerdebeer.org/Software/virtual_botanical_laboratory/).

## Interface {#interface}

::paru::insert interface.md

## The L-system language  {#l-system}

::paru::insert lsystem_language.md

## References
