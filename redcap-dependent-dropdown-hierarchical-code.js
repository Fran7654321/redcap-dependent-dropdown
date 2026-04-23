$(document).ready(function () {

    // =====================================================
    // CONFIGURATION (EDIT THIS SECTION ONLY)
    // =====================================================
    // separator: Character used to separate hierarchy levels.
    //
    // Example: 1.2.3
    // You may change it if needed, for example to '|' as long as your codes are consistent.
    //
    // metadataSeparator:
    // Fixed separator used only when you need to preserve
    // additional code after the hierarchical part.
    //
    // Example:
    // 1.2::01|02|2026
    //
    // In that case:
    // - hierarchy used by the script = 1.2
    // - additional code preserved in the value = 01|02|2026
    //
    // If your values do not contain '::', the script will
    // simply use the full value as hierarchy.
    //
    // chains: One or more independent hierarchical chains.
    //
    // Each chain is an ordered list of dropdown field names.
    // The script will filter each level based only on the
    // previous level in that same chain.
    //
    // Example:
    // ['region', 'province', 'city']
    //
    // You can define multiple independent chains in the
    // same form.
    // =====================================================

var separator = '.';   // ⭐ recomendado
// var separator = '|';
var metadataSeparator = '::';
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
    //
    // originalOptions:
    // Stores the full original list of options for each field.
    //
    // previousValues:
    // Keeps track of the last known value of each field.
    // =====================================================

    var originalOptions = {};
    var previousValues = {};

    // =====================================================
    // HELPER FUNCTIONS
    // =====================================================

    // Return the <select> element for a given REDCap field name
    function getSelect(fieldName) {
        return document.querySelector('select[name="' + fieldName + '"]');
    }

    // Return the current value of a dropdown field
    function getValue(fieldName) {
        var sel = getSelect(fieldName);
        return sel ? (sel.value || '') : '';
    }

    // Extract only the hierarchical part of the code
    //
    // Example:
    // 1|2::01.02.2026  ->  1|2
    // 1|2|3            ->  1|2|3
    function getHierarchyPart(code) {
        if (!code) return '';
        return code.split(metadataSeparator)[0];
    }

    // Count hierarchy levels based only on the hierarchical part
    //
    // Example:
    // 1|2|3 -> 3 segments
    function countSegments(code) {
        var hierarchy = getHierarchyPart(code);
        if (!hierarchy) return 0;
        return hierarchy.split(separator).length;
    }

    // Check whether childCode is a direct child of parentCode
    //
    // A direct child must:
    // 1. Start with parent + separator
    // 2. Have exactly one more hierarchy level
    //
    // Example:
    // parent: 7
    // child:  7|1      -> true
    // child:  7|1|1    -> false (grandchild, not direct child)
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

    // Store the original dropdown options for a field only once
    //
    // This allows the script to rebuild filtered dropdowns
    // without losing the original full option list.
    function storeOriginalOptions(fieldName) {
        var sel = getSelect(fieldName);
        if (!sel) return;

        if (!originalOptions[fieldName]) {
            var opts = [];
            for (var i = 0; i < sel.options.length; i++) {
                opts.push({
                    value: sel.options[i].value,
                    label: sel.options[i].text
                });
            }
            originalOptions[fieldName] = opts;
        }
    }

    // Filter a child dropdown based on the selected value
    // of its parent dropdown
    function filterChildField(parentField, childField) {
        var parentValue = getValue(parentField);
        var childSelect = getSelect(childField);

        if (!childSelect) return;

        var currentChildValue = childSelect.value;
        var options = originalOptions[childField] || [];

        // Rebuild the child dropdown from scratch
        childSelect.innerHTML = '';
        childSelect.appendChild(new Option('', ''));

        // If the parent is empty, leave child empty as well
        if (!parentValue) {
            childSelect.value = '';
            return;
        }

        var allowedValues = [];

        for (var i = 0; i < options.length; i++) {
            var op = options[i];

            if (isDirectChild(parentValue, op.value)) {
                childSelect.appendChild(new Option(op.label, op.value));
                allowedValues.push(op.value);
            }
        }

        // Keep the current value only if it is still valid
        if (allowedValues.indexOf(currentChildValue) !== -1) {
            childSelect.value = currentChildValue;
        } else {
            childSelect.value = '';
        }
    }

    // Starting from a given level, update all following levels
    // in the same chain
    //
    // Example:
    // region -> province -> city
    //
    // If region changes, province and city must be updated
    // If province changes, only city must be updated
    function updateChainFromLevel(chain, parentIndex) {
        for (var i = parentIndex; i < chain.levels.length - 1; i++) {
            var parentField = chain.levels[i];
            var childField = chain.levels[i + 1];

            filterChildField(parentField, childField);
        }
    }

    // Find which chain and which level a field belongs to
    //
    // Returns:
    // {
    //   chainIndex: ...,
    //   levelIndex: ...
    // }
    //
    // or null if not found
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

    // Refresh the stored current values of all fields
    function refreshStoredValues() {
        for (var c = 0; c < chains.length; c++) {
            var chain = chains[c];
            for (var i = 0; i < chain.levels.length; i++) {
                var fieldName = chain.levels[i];
                previousValues[fieldName] = getValue(fieldName);
            }
        }
    }

    // =====================================================
    // INITIALIZATION
    // =====================================================
    //
    // 1. Store original options for all configured fields
    // 2. Store their initial values
    // 3. Apply initial filtering
    // 4. Refresh stored values after filtering
    // =====================================================

    for (var c = 0; c < chains.length; c++) {
        var chain = chains[c];
        for (var i = 0; i < chain.levels.length; i++) {
            var fieldName = chain.levels[i];
            storeOriginalOptions(fieldName);
            previousValues[fieldName] = getValue(fieldName);
        }
    }

    for (var c = 0; c < chains.length; c++) {
        updateChainFromLevel(chains[c], 0);
    }

    refreshStoredValues();

    // =====================================================
    // EVENT-DRIVEN UPDATE (SAFE VERSION)
    // =====================================================
    //
    // Build a selector that includes every configured dropdown
    // across all chains.
    //
    // Example:
    // select[name="region"], select[name="province"], ...
    //
    // Then listen for change events and update only the
    // relevant chain.
    // =====================================================

    var selectorParts = [];

    for (var c = 0; c < chains.length; c++) {
        var chain = chains[c];
        for (var i = 0; i < chain.levels.length; i++) {
            selectorParts.push('select[name="' + chain.levels[i] + '"]');
        }
    }

    var selector = selectorParts.join(', ');

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
