$(document).ready(function () {

    // =====================================================
    // CONFIGURATION
    // =====================================================
    var chains = [
        {
            levels: ['region', 'province', 'city']
        },
        {
            levels: ['service', 'unit', 'room']
        }
    ];

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

    function countSegments(code) {
        if (!code) return 0;
        return code.split('.').length;
    }

    function isDirectChild(parentCode, childCode) {
        if (!parentCode || !childCode) return false;

        var prefix = parentCode + '.';

        return (
            childCode.indexOf(prefix) === 0 &&
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