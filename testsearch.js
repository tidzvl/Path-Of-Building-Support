const targetNode = document.querySelector('div[data-hk="25.0"]');

const config = { attributes: true, childList: true, subtree: true };

const returnedValues = new Set();

const callback = function(mutationsList, observer) {
    for(let mutation of mutationsList) {
        if (mutation.type === 'childList' || mutation.type === 'attributes') {
            const rarity = targetNode.querySelector('[data-rarity]');
            if (rarity && !returnedValues.has(rarity.getAttribute('data-rarity'))) {
                console.log(`data-rarity="${rarity.getAttribute('data-rarity')}"`);
                returnedValues.add(rarity.getAttribute('data-rarity'));
            }

            const divElements = targetNode.querySelectorAll('div');
            divElements.forEach(div => {
                const divText = div.childNodes.length === 1 && div.childNodes[0].nodeType === Node.TEXT_NODE ? div.textContent : '';
                if (divText && !returnedValues.has(divText)) {
                    console.log(divText);
                    returnedValues.add(divText);
                }
            });

            const ulElements = targetNode.querySelectorAll('ul');
            ulElements.forEach(ul => {
                if (!returnedValues.has(ul.outerHTML)) {
                    console.log(ul.outerHTML);
                    returnedValues.add(ul.outerHTML);
                }
            });
        }
    }
};

const observer = new MutationObserver(callback);
observer.observe(targetNode, config);

// observer.disconnect();
