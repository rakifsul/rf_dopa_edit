/**
 * function to create rfx API object, which will be used to do web browsing tasks later.
 * @param {WebContents} webContents - Target WebContents
 */
async function rfxAPI(webContents) {
    /**
     * rfx API object.
     * @exports rfxAPI/rfx
     * @namespace rfx
     */
    let rfx = {};

    /**
     * shorthand for webContents object.
     * @memberof rfx
     */
    rfx.w = webContents;

    /**
     * basic right view scope (injected) functions definitions.
     * @memberof rfx
     */
    rfx.lib = `
        async function setIntervalAsync(_callback, _timeout, _tries) {
            let ctr = 0;
            let prom = new Promise((resolve, reject) => {
                const ivID = setInterval(async () => {
                if (await _callback()) {
                    resolve();
                    clearInterval(ivID);
                } else {
                    if (ctr >= _tries - 1) {
                        reject();
                        clearInterval(ivID);
                    }
                }
                ctr++;
                }, _timeout);
            });
            return prom;
        }

        async function simType(_selector, _text, _delay){
            let input = document.querySelector(_selector);
            input.select();
            input.value="";
            let current = 0;

            await setIntervalAsync(function(){
                input.value += _text[current];
                current++;
            }, _delay, _text.length);
        }

        function injectText(_selector, _text){
            let input = document.querySelector(_selector);
            input.select();
            input.setAttribute('value',_text);
        }
    `;

    /**
     * goTo function definition.
     * @memberof rfx
     * @method goTo
     * @param {string} url - target URL.
     * @param {object} options - see documentation of Electron.
     */
    rfx.goTo = async function (url, options) {
        return rfx.w.loadURL(url, options);
    };

    /**
     * goBack function definition.
     * @memberof rfx
     * @method goBack
     */
    rfx.goBack = function () {
        return rfx.w.goBack();
    };

    /**
     * goForward function definition.
     * @memberof rfx
     * @method goForward
     */
    rfx.goForward = function () {
        return rfx.w.goForward();
    };

    /**
     * waitForSelector function definition.
     * @memberof rfx
     * @method waitForSelector
     * @param {string} selector - target selector.
     * @param {number} timeout - timeout of interval.
     * @param {number} tries - until how many times trials are rejected.
     */
    rfx.waitForSelector = function (selector, timeout, tries) {
        const script = `
        ${rfx.lib}
        (async function() {
            return await setIntervalAsync(function () {
                if (document.querySelector("${selector}") === null) {
                    return false;
                } else {
                    return true;
                }
            }, ${timeout}, ${tries});
            })();
        `;

        return rfx.w.executeJavaScript(script);
    };

    /**
     * waitForTimeout function definition.
     * @memberof rfx
     * @method waitForTimeout
     * @param {number} timeInMiliSecond - how long does timeout takes.
     */
    rfx.waitForTimeout = function (timeInMiliSecond) {
        return new Promise(function (resolve, reject) {
            setTimeout(() => {
                resolve("Time passed: " + timeInMiliSecond);
            }, timeInMiliSecond);
        });
    };

    /**
     * waitForVisible function definition.
     * waitForVisible waits for selector until seen.
     * @memberof rfx
     * @method waitForVisible
     * @param {string} selector - target selector.
     * @param {number} timeout - timeout of interval.
     * @param {number} tries - until how many times trials are rejected.
     */
    rfx.waitForVisible = function (selector, timeout, tries) {
        const script = `
      ${rfx.lib}
      (async function() {
        return await setIntervalAsync(function () {
          function isVisible(_selector) {
            const element = document.querySelector(_selector);
            if(!element){
              return false;
            }
            const boundingClientRect = element.getBoundingClientRect();
            const step1 = boundingClientRect.height || boundingClientRect.width;
            const step2 = boundingClientRect.bottom || boundingClientRect.top;
            const step3 = step1 || step2;
            return !!(step3);
          }

          const element1 = document.querySelector("${selector}");
          if(!element1){
            return false;
          }
          const myComputedStyle = window.getComputedStyle(element1);
          return myComputedStyle && isVisible("${selector}") && myComputedStyle.visibility !== 'hidden';
        }, ${timeout}, ${tries});
      })();
    `;

        return rfx.w.executeJavaScript(script);
    };

    /**
     * click function definition.
     * click triggers click event to the selector.
     * @memberof rfx
     * @method click
     * @param {string} selector - target selector.
     */
    rfx.click = function (selector) {
        const script = `
        document.querySelector("${selector}").click();
      `;

        return rfx.w.executeJavaScript(script);
    };

    /**
     * simulated typing function definition.
     * @memberof rfx
     * @method simType
     * @param {string} selector - target selector.
     * @param {string} text - what to type.
     * @param {number} delay - delay for each characters.
     */
    rfx.simType = function (selector, text, delay = 1000) {
        const script = `
      ${rfx.lib}
      (async function() {
        await simType("${selector}", "${text}", ${delay});
      })();
    `;

        return rfx.w.executeJavaScript(script);
    };

    /**
     * injectText function definition.
     * injectText injects text instantly to element at selector.
     * @memberof rfx
     * @method injectText
     * @param {string} selector - target selector.
     * @param {string} text - text content.
     */
    rfx.injectText = function (selector, text) {
        const script = `
      ${rfx.lib}
      injectText("${selector}", "${text}");
    `;

        return rfx.w.executeJavaScript(script);
    };

    /**
     * evaluate function definition.
     * evaluate runs script at current web page.
     * @memberof rfx
     * @method evaluate
     * @param {string} script - javascript to run.
     */
    rfx.evaluate = function (script) {
        const finalScript = `
      (async function() {
        ${script}
      })();
    `;
        return rfx.w.executeJavaScript(finalScript);
    };

    return rfx;
}

export default rfxAPI;
