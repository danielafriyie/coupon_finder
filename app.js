// get current domain
let domain = window.location.hostname;
domain = domain.replace('http://', '').replace('https://', '').replace('www.', '').split(/[/?#]/)[0];

function copyToClipboard(string) {
    let input = document.createElement('textarea');
    input.innerHTML = string;
    document.body.appendChild(input);
    input.select();
    let result = document.execCommand('copy');
    document.body.removeChild(input);
    return result;
}

function createEvents() {
    document.querySelectorAll('._coupon__list .code').forEach((codeItem) => {
        codeItem.addEventListener('click', () => {
            let codeString = codeItem.innerHTML;
            copyToClipboard(codeString);
        });
    });

    document.querySelector('._submit-overlay .close').addEventListener('click', () => {
        document.querySelector('._submit-overlay').style.display = 'none';
    });

    document.querySelector('._coupon__list .submit-button').addEventListener('click', () => {
        document.querySelector('._submit-overlay').style.display = 'block';
    });

    document.querySelector('._submit-overlay .submit-coupon').addEventListener('click', () => {
        let code = document.querySelector('._submit-overlay .code').value;
        let description = document.querySelector('._submit-overlay .description').value;
        submitCoupon(code, description, domain)
    });

    document.querySelector('._coupon__button').addEventListener('click', () => {
        let coupon = document.querySelector('._coupon__list');
        if (coupon.style.display !== 'none') {
            coupon.style.display = 'none';
        } else {
            coupon.style.display = 'block';
        }
    });
}

function parseCoupons(coupons, domain) {
    try {
        let couponHTML = '';
        for (let key in coupons) {
            let coupon = coupons[key];
            couponHTML += `<li>
                               <span class="code">${coupon.code}</span>
                               <p>${coupon.description}</p>
                           </li>`
        }

        if (couponHTML === '') {
            couponHTML += '<p>Be the first to add coupon for this site.</p>';
        }

        let couponDisplay = document.createElement('div');
        couponDisplay.className = '_coupon__list';
        couponDisplay.innerHTML = `
            <div class="submit-button">Submit Coupon</div>
            <h1>Coupons</h1>
            <p>Browse coupons below that have been used for: <strong>${domain}</strong></p>
            <p style="font-style: italic;">Click any coupon to copy and &amp; use.</p>
            <ul>${couponHTML}</ul>
        `;
        couponDisplay.style.display = 'none';
        document.body.appendChild(couponDisplay);

        let couponButton = document.createElement('div');
        couponButton.className = '_coupon__button';
        couponButton.innerHTML = 'C';
        document.body.appendChild(couponButton);

        let couponSubmitOverlay = document.createElement('div');
        couponSubmitOverlay.className = '_submit-overlay';
        couponSubmitOverlay.innerHTML = `
            <span class="close" id="close">X</span>
            <h3>Do you have a coupon for this site?</h3>
            <div>
                <label for="code">Code</label>
                <input type="text" id="code" class="code">
            </div>
            <div>
                <label for="description">Description</label>
                <input type="text" id="description" class="description">
            </div>
            <div>
                <button class="submit-coupon">Submit Coupon</button>
            </div>
        `;
        couponSubmitOverlay.style.display = 'none';
        document.body.appendChild(couponSubmitOverlay);

        createEvents();
    } catch (e) {
        console.log('no coupons found on this page', e);
    }
}

chrome.runtime.sendMessage({command: "fetch", data: {domain: domain}}, (response) => {
    // response from database (background.html > firebase.js)
    parseCoupons(response.data, domain)
});

function submitCouponCallback(response, domain) {
    document.querySelector('._submit-overlay').style.display = 'none';
    alert('coupon submitted!!');
}

function submitCoupon(code, description, domain) {
    console.log('submit coupon', {code: code, description: description, domain: domain});
    chrome.runtime.sendMessage({
        command: "post",
        data: {code: code, description: description, domain: domain}
    }, (response) => {
        submitCouponCallback(response.data, domain);
    });
}

