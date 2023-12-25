let xValid = false, yValid = false, rValid = false;
var selectValidValues = [-3, -2, -1, 0, 1, 2, 3, 4, 5];
var buttonValidValues = [1, 2, 3, 4, 5];

function validateSelection(value, validValues) {
    return validValues.includes(value);
}
let selectedXBtn;
let selectedRCheckbox;
const errorMessageBox = document.getElementById('error-message');

// X buttons
const xBtns = document.querySelectorAll('.form__x-btn');
xBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const selectedValue = parseFloat(btn.value);
        xBtns.forEach(otherBtn => {
            otherBtn.classList.remove('selected-btn');
        });

        if (selectedValue !== selectedXBtn) {
            if (validateSelection(selectedValue, selectValidValues)) {
                btn.classList.add('selected-btn');
                selectedXBtn = selectedValue;
                xValid = true;
                errorMessageBox.textContent = '';
            } else {
                selectedXBtn = undefined;
                xValid = false;
                errorMessageBox.textContent = 'Check the value.';
            }
        } else {
            btn.classList.remove('selected-btn');
            selectedXBtn = undefined;
            xValid = false;
            errorMessageBox.textContent = 'Check the value.';
        }

        toggleSubmitBtn();
    });
});

// R checkboxes
const rCheckboxes = document.querySelectorAll('input[type="checkbox"][name="r"]');
rCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
            const selectedValue = parseFloat(checkbox.value);
            rCheckboxes.forEach(otherCheckbox => {
                if (otherCheckbox !== checkbox) {
                    otherCheckbox.checked = false;
                }
            });

            if (validateSelection(selectedValue, buttonValidValues)) {
                selectedRCheckbox = selectedValue;
                rValid = true;
                errorMessageBox.textContent = '';
            } else {
                selectedRCheckbox = undefined;
                rValid = false;
                errorMessageBox.textContent = 'Check the value.';
            }
        } else {
            selectedRCheckbox = undefined;
            rValid = false;
            errorMessageBox.textContent = 'Check the value.';
        }

        redrawGraph(selectedRCheckbox ? selectedRCheckbox : "R");
        toggleSubmitBtn();
    });
});


const yInput = document.querySelector('input[name="y"]');
yInput.addEventListener('input', () => {
    yValid = false;
    if (yInput.value.length > 17) {
        yInput.value = yInput.value.slice(0, 17);
    }

    const regex = /[-+]?\d+/;
    if (!regex.test(yInput.value)) {
        yInput.setCustomValidity('Check the value here.');
        yInput.reportValidity();
        toggleSubmitBtn();
        return;
    }

    const yValue = parseFloat(yInput.value.trim().replace(',', '.'));
    if (isNaN(yValue)) {
        yInput.setCustomValidity('Check the value.');
    } else if (yValue < -3 || yValue > 3) {
        yInput.setCustomValidity('The value must be in the interval (-3 ... 3).');
    } else {
        yValid = true;
        yInput.setCustomValidity('');
    }
    yInput.reportValidity();
    toggleSubmitBtn();
});

const submitBtn = document.querySelector('.form__big-btn[type="submit"]');
function toggleSubmitBtn() {
    submitBtn.disabled = !(xValid && yValid && rValid)
}

function formatParams(params) {
    return "?" + Object
        .keys(params)
        .map(function (key) {
            return key + "=" + encodeURIComponent(params[key])
        })
        .join("&")
}

const tbody = document.querySelector('.main__table tbody');

const form = document.querySelector('.form');
form.addEventListener('submit', e => {
    e.preventDefault();
    let params = {
        'x': selectedXBtn,
        'y': yInput.value,
        'r': selectedRCheckbox
    }
    const target = 'php/submit.php' + formatParams(params)

    const xhr = new XMLHttpRequest();
    xhr.open('GET', target);

    xhr.onloadend = () => {
        if (xhr.status === 200) {
            window.location.href = "table.html";
            tbody.innerHTML = xhr.response;

            let isHit = document.querySelector('tbody tr:last-child td:last-child span').classList.contains('hit')
            printDotOnGraph(xBtns.value, yInput.value, isHit)
        } else {
            console.log("status: ", xhr.status);
            if (xhr.status >= 400 && xhr.status < 600) {
                errorMessageBox.textContent = `An error has occurred: ${xhr.status} - ${xhr.statusText}`;
            }
        }
    };
    xhr.send();
})

// Clear
const clearBtn = document.querySelector('.form__big-btn[type="reset"]');
clearBtn.addEventListener("click", e => {
    e.preventDefault();

    let xhr = new XMLHttpRequest();
    xhr.onloadend = () => {
        if (xhr.status === 200) {
            tbody.innerHTML = '';
        } else {
            console.log("status: ", xhr.status);
            if (xhr.status >= 400 && xhr.status < 600) {
                errorMessageBox.textContent = `An error has occurred: ${xhr.status} - ${xhr.statusText}`;
            }
        }
    };
    xhr.open("POST", "php/clear.php");
    xhr.send();
})


// Previous table data
window.onload = () => {
    let xhr = new XMLHttpRequest();
    xhr.onloadend = () => {
        if (xhr.status === 200) {
            const tbody = document.querySelector('.main__table tbody');
            tbody.innerHTML = xhr.response;
        } else {
            console.log("status: ", xhr.status);
            if (xhr.status >= 400 && xhr.status < 600) {
                errorMessageBox.textContent = `An error has occurred: ${xhr.status} - ${xhr.statusText}`;
            }
        }
    };
    xhr.open("GET", "php/init.php");
    xhr.send();
}