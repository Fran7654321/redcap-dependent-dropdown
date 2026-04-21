// =====================================================
// REUSABLE TEMPLATE: DEPENDENT DROPDOWN IN REDCAP
// -----------------------------------------------------
// EDIT ONLY:
//   1) variable_controladora
//   2) variable_dependiente
//   3) mapa_opciones
// =====================================================

$(document).ready(function () {

    // 🔹 CONFIGURATION
    var variable_controladora = 'especialidad';       // <-- CHANGE
    var variable_dependiente = 'nombre_especialista'; // <-- CHANGE

    // 🔹 MAPPING (controlling value → allowed options)
    var mapa_opciones = {
        '1': [
            { value: '1.1', label: 'Option A1' },
            { value: '1.2', label: 'Option A2' }
        ],
        '2': [
            { value: '2.1', label: 'Option B1' },
            { value: '2.2', label: 'Option B2' }
        ]
    };

    function getControllingValue() {
        var select = document.querySelector('select[name="' + variable_controladora + '"]');
        if (select) return select.value || '';

        var radio = document.querySelector('input[name="' + variable_controladora + '"]:checked');
        if (radio) return radio.value || '';

        return '';
    }

    function filterDependentOptions() {

        var value = getControllingValue();

        var select = document.querySelector(
            'select[name="' + variable_dependiente + '"]'
        );

        if (!select) return;

        var currentValue = select.value;
        var options = mapa_opciones[value] || [];
        var allowed = [];

        select.innerHTML = '';
        select.appendChild(new Option('', ''));

        options.forEach(function (op) {
            select.appendChild(new Option(op.label, op.value));
            allowed.push(op.value);
        });

        if (allowed.indexOf(currentValue) !== -1) {
            select.value = currentValue;
        } else {
            select.value = '';
        }
    }

    // Initial execution
    filterDependentOptions();

    // Update when controlling field changes
    document.addEventListener('change', function (e) {
        if (e.target && e.target.name === variable_controladora) {
            filterDependentOptions();
        }
    });

});