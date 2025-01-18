const targetNodes = document.querySelectorAll('div.absolute.z-30.pointer-events-none.hidden.overflow-hidden');

const config = { attributes: true, childList: true, subtree: true };

const returnedValues = new Set();

const callback = function(mutationsList, observer) {
    for(let mutation of mutationsList) {
        if (mutation.type === 'childList' || mutation.type === 'attributes') {
            mutation.target.querySelectorAll('[data-rarity]').forEach(rarity => {
                if (!returnedValues.has(rarity.getAttribute('data-rarity'))) {
                    console.log(`data-rarity="${rarity.getAttribute('data-rarity')}"`);
                    returnedValues.add(rarity.getAttribute('data-rarity'));
                }
            });
            
            mutation.target.querySelectorAll('div').forEach(div => {
                const divText = div.childNodes.length === 1 && div.childNodes[0].nodeType === Node.TEXT_NODE ? div.textContent : '';
                if (divText && !returnedValues.has(divText)) {
                    console.log(divText);
                    returnedValues.add(divText);
                }
            });

            mutation.target.querySelectorAll('ul').forEach(ul => {
                if (!returnedValues.has(ul.outerHTML)) {
                    console.log(ul.outerHTML);
                    returnedValues.add(ul.outerHTML);
                }
            });
        }
    }
};

targetNodes.forEach(node => {
    const observer = new MutationObserver(callback);
    observer.observe(node, config);
});

// observer.disconnect();

//list of strat: https://www.pathofexile.com/api/trade/data/stats
//list of item: https://www.pathofexile.com/api/trade/data/items
