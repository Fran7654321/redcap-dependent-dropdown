# REDCap Dependent Dropdown

Reusable JavaScript solutions for creating **dependent dropdown fields in REDCap** using an External Module such as **Shazam**.

---

## Overview

REDCap does not natively support dynamic filtering of dropdown choices within the same form without saving or reloading the page.

This repository provides **two complementary approaches**:

| Version | Use case |
|--------|--------|
| **Explicit Mapping** | Custom relationships, small or medium lists |
| **Hierarchical Code (multi-chain)** | Multi-level filtering using structured codes |

Both approaches improve user experience by updating dropdowns **immediately on the client side**.

---

## Quick start

1. Add your fields in REDCap:
   - controlling variable(s)
   - dependent dropdown(s)

2. Paste the JavaScript into your External Module  
   (e.g., **Shazam**)

3. Configure the script depending on the version you choose

---

# 1) Explicit Mapping Version

## Description

This version uses a **mapping object** to define relationships between values.

Best for:
- simple dependencies
- non-hierarchical data
- small to medium lists

---

## Configuration

### Controlling variable

    var variable_controladora = 'specialty';

### Dependent variable

    var variable_dependiente = 'specialist_name';

### Mapping object

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

---

## Requirements

- Both fields must be **dropdown lists**
- Both fields must contain the same choice lists (code, label)
- Labels containing apostrophes must be escaped:

    { value: '8.1', label: 'O\\'Higgins' }

---

# 2) Hierarchical Code Version (multi-chain supported)

## Description

This version uses **hierarchical codes** to define relationships automatically.

It supports **one or multiple independent hierarchical chains** within the same form.

Example:

- `7` → Region  
- `7.1` → Province  
- `7.1.1` → City  

No mapping object is required.

---

## How it works

The script:
- reads the selected value
- identifies **direct children** based on code structure
- filters the next dropdown in the chain
- supports multiple independent chains

---

## Requirements

- Fields must be **dropdown lists**
- Each dropdown must contain **all options for its own level**
- Each dropdown must contain **only one level**
- Codes must follow a hierarchical structure:

    7  
    7.1  
    7.1.1  

---

## Important behavior

The script filters only:

👉 **direct children (one level down)**

Example:

- Selecting `7` shows:
  - `7.1`, `7.2`
- NOT:
  - `7.1.1`

---

## Configuration

### Single chain

    var chains = [
        {
            levels: ['region', 'province', 'city']
        }
    ];

### Multiple independent chains

    var chains = [
        {
            levels: ['region', 'province', 'city']
        },
        {
            levels: ['service', 'unit', 'room']
        }
    ];

---

## Example use case

- `region` → `province` → `city`
- `service` → `unit` → `room`
- `category` → `subcategory` → `item`

Each chain works independently.

---

# How to use (both versions)

### 1. Add fields in REDCap

Example (mapping version):

- controlling variable: `specialty`
- dependent variable: `specialist_name`

Example (hierarchical version):

- `region`
- `province`
- `city`

---

### 2. Paste JavaScript

Use an External Module such as:

- Shazam
- or any custom JS injector

---

### 3. Test behavior

- change controlling value
- verify dependent dropdown updates immediately
- verify invalid selections are cleared

---

# Files

## Files and examples

- [⬇ Download Explicit Mapping Script](https://raw.githubusercontent.com/Fran7654321/redcap-dependent-dropdown/main/explicit-mapping.js)
- ![Demo](redcap-dependent-dropdown.gif)
- [⬇ Download Hierarchical Code Script](https://raw.githubusercontent.com/Fran7654321/redcap-dependent-dropdown/main/hierarchical-code.js)
- ![Demo](hierarchical_code_(multi_chain).gif)

---

# Reusable template

These scripts can be adapted to:

- region → city
- category → item
- service → provider
- country → state/province
- multi-level hierarchies

---

# Limitations

- This is a **UI-level solution**
- It does **not validate imported data (CSV/API)**
- If a parent value changes, dependent values may reset
- Requires correct field configuration

---

# Troubleshooting

## Dropdown does not update

Check:
- field names match exactly
- fields are dropdown lists
- values are correctly coded
- hierarchical codes are consistent

## Works in one project but not another

Some REDCap environments do not reliably trigger `change` events.

👉 In that case, use a version with polling fallback.

---

# Recommended good practice

- Keep dropdown values documented
- Use consistent coding systems
- Avoid manual duplication of labels
- Test edge cases (empty values, changes)

---

# Transparency

Part of the JavaScript structure and documentation was refined with the assistance of ChatGPT.

English is not my first language, so please excuse any wording issues.

---

# License

MIT
