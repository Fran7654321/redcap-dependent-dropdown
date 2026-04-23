$(document).ready(function () {
    // =====================================================
    // CONFIGURATION (EDIT THIS SECTION ONLY)
    // =====================================================
    // separator:
    // Character used to separate hierarchical levels (e.g., 1.2.3 or 1|2|3)
    var separator = '.'; // you can also use '|'

    // metadataSeparator:
    // Character(s) used to separate the hierarchical part
    // from the rest of the code (if any additional code exists)
    //
    // Example: 1.2::01|02|2026 or 1|2::01.02.2026
    // Hierarchical part (used by the script): 1.2 or 1|2
    // Additional code (ignored for filtering): 01|02|2026 or 01.02.2026
    var metadataSeparator = '::';
     // - metadataSeparator is OPTIONAL and must appear at most once in each value.
    //   It is only used if you need to include additional code beyond the hierarchical structure.

    // IMPORTANT:
    //   The separator is used ONLY to define hierarchy levels.
    //   It must not appear inside level values.
    //   Example (valid): 1.2.3
    //   Example (invalid): 1.2.1|2.123  ← ambiguous for the script
    //   Example WITHOUT metadata (most common): 1.2.3
    //   Example WITH metadata: 1.2::01|02|2026
    //       In that case:
    //       - Hierarchy used by the script → 1.2 
    //       - Additional code preserved → 01|02|2026 
    //   Example (invalid): 1|2::01::02.2026  ← ambiguous split
    // =====================================================
    // Define one or more independent hierarchical chains
    var chains = [
        {
            levels: ['region', 'province', 'city']
        },
        {
            levels: ['service', 'unit', 'room']
        }
    ];

    // =====================================================
    // INTERNAL STATE (DO NOT EDIT)
    // =====================================================

    var originalOptions = {};
    var previousValues = {};

    // =====================================================
    // HELPER FUNCTIONS
    // =====================================================

    function getSelect(fieldName) {
        return document.querySelector('select[name="' + fieldName + '"]');
    }

    function getValue(fieldName) {
        var sel = getSelect(fieldName);
        return sel ? (sel.value || '') : '';
    }

    // Extract only the hierarchical part of the code
    function getHierarchyPart(code) {
        if (!code) return '';
        return code.split(metadataSeparator)[0];
    }

    // Count levels based on hierarchy only
    function countSegments(code) {
        var hierarchy = getHierarchyPart(code);
        if (!hierarchy) return 0;
        return hierarchy.split(separator).length;
    }

    // Check if child is a direct child of parent
    function isDirectChild(parentCode, childCode) {
        var parentHierarchy = getHierarchyPart(parentCode);
        var childHierarchy = getHierarchyPart(childCode);

        if (!parentHierarchy || !childHierarchy) return false;

        var prefix = parentHierarchy + separator;

        return (
            childHierarchy.indexOf(prefix) === 0 &&
            countSegments(childCode) === countSegments(parentCode) + 1
        );
    }

    function storeOriginalOptions(fieldName) {
        var sel = getSelect(fieldName);
        if (!sel) return;

        if (!originalOptions[fieldName]) {
            originalOptions[fieldName] = Array.from(sel.options).map(function (op) {
                return {
                    value: op.value,
                    label: op.text
                };
            });
        }
    }

    function filterChildField(parentField, childField) {
        var parentValue = getValue(parentField);
        var childSelect = getSelect(childField);

        if (!childSelect) return;

        var currentChildValue = childSelect.value;
        var options = originalOptions[childField] || [];

        childSelect.innerHTML = '';
        childSelect.appendChild(new Option('', ''));

        if (!parentValue) {
            childSelect.value = '';
            return;
        }

        var allowedValues = [];

        options.forEach(function (op) {
            if (isDirectChild(parentValue, op.value)) {
                childSelect.appendChild(new Option(op.label, op.value));
                allowedValues.push(op.value);
            }
        });

        if (allowedValues.indexOf(currentChildValue) !== -1) {
            childSelect.value = currentChildValue;
        } else {
            childSelect.value = '';
        }
    }

    function updateChainFromLevel(chain, parentIndex) {
        for (var i = parentIndex; i < chain.levels.length - 1; i++) {
            var parentField = chain.levels[i];
            var childField = chain.levels[i + 1];

            filterChildField(parentField, childField);
        }
    }

    function findChainAndLevel(fieldName) {
        for (var c = 0; c < chains.length; c++) {
            for (var i = 0; i < chains[c].levels.length; i++) {
                if (chains[c].levels[i] === fieldName) {
                    return {
                        chainIndex: c,
                        levelIndex: i
                    };
                }
            }
        }
        return null;
    }

    function refreshStoredValues() {
        chains.forEach(function (chain) {
            chain.levels.forEach(function (fieldName) {
                previousValues[fieldName] = getValue(fieldName);
            });
        });
    }

    // =====================================================
    // INITIALIZATION
    // =====================================================

    chains.forEach(function (chain) {
        chain.levels.forEach(function (fieldName) {
            storeOriginalOptions(fieldName);
            previousValues[fieldName] = getValue(fieldName);
        });
    });

    chains.forEach(function (chain) {
        updateChainFromLevel(chain, 0);
    });

    refreshStoredValues();

    // =====================================================
    // EVENT-DRIVEN UPDATE
    // =====================================================

    var selector = chains
        .flatMap(function (chain) {
            return chain.levels.map(function (fieldName) {
                return 'select[name="' + fieldName + '"]';
            });
        })
        .join(', ');

    $(document).on('change', selector, function () {
        var fieldName = this.name;
        var match = findChainAndLevel(fieldName);

        if (!match) return;

        var chain = chains[match.chainIndex];
        var levelIndex = match.levelIndex;

        if (levelIndex < chain.levels.length - 1) {
            updateChainFromLevel(chain, levelIndex);
        }

        refreshStoredValues();
    });

});
