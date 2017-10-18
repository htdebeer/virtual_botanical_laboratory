#!/usr/bin/env ruby

puts $stdin.read
puts "\n"
puts "---"
puts "pandocomatic_:"
puts "    pandoc:"
puts "        bibliography: './documentation/data-dir/bibliography.bib'"
puts "        csl: './documentation/data-dir/apa.csl'"
puts "        filter:"
puts "        - './documentation/data-dir/number_all_the_things.rb'"
puts "..."
