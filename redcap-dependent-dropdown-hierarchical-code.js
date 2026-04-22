$(document).ready(function () {

    // =====================================================
    // CONFIGURATION
    // =====================================================
    var levels = [
        { field: 'region' },
        { field: 'province' },
        { field: 'city' }
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

    function updateFromLevel(parentIndex) {
        for (var i = parentIndex; i < levels.length - 1; i++) {
            var parentField = levels[i].field;
            var childField = levels[i + 1].field;

            filterChildField(parentField, childField);
        }
    }

    function findLevelIndex(fieldName) {
        for (var i = 0; i < levels.length; i++) {
            if (levels[i].field === fieldName) {
                return i;
            }
        }
        return -1;
    }

    // =====================================================
    // INITIALIZATION
    // =====================================================
    levels.forEach(function (level) {
        storeOriginalOptions(level.field);
        previousValues[level.field] = getValue(level.field);
    });

    updateFromLevel(0);

    // =====================================================
    // EVENT-DRIVEN UPDATE ONLY
    // =====================================================
    var selector = levels.map(function (level) {
        return 'select[name="' + level.field + '"]';
    }).join(', ');

    $(document).on('change', selector, function () {
        var fieldName = this.name;
        var index = findLevelIndex(fieldName);

        if (index !== -1) {
            updateFromLevel(index);

            // refresh stored values
            levels.forEach(function (lvl) {
                previousValues[lvl.field] = getValue(lvl.field);
            });
        }
    });

});