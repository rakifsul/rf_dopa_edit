## Introduction

Here is the RF Dopa Edit API tutorial in the form of example code.

This tutorial consists of example codes and comments to help you learn more quickly.

## Code Example: Await

```
// RF Dopa Edit runs codes in asynchronous block.
// So, you can use await instantly without wrapping it in a function.
// rfx is a namespace for navigational methods.

// open https://quotes.toscrape.com/tag/inspirational/
await rfx.goTo("https://quotes.toscrape.com/tag/inspirational/");

// run popup alert on that page.
await rfx.evaluate(`alert();`);

// open https://quotes.toscrape.com/tag/life/
await rfx.goTo("https://quotes.toscrape.com/tag/life/");
```

## Code Example: Click

```
// open https://quotes.toscrape.com
await rfx.goTo("https://quotes.toscrape.com");

// wait until the selector at the first argument appears.
// timeout = 100
// tries = 300
await rfx.waitForSelector("body > div > div:nth-child(2) > div.col-md-4.tags-box > span:nth-child(7) > a", 100, 300);

// click at the selector
await rfx.click("body > div > div:nth-child(2) > div.col-md-4.tags-box > span:nth-child(7) > a");
```

## Code Example: Timeout

```
// open https://quotes.toscrape.com/tag/inspirational/
await rfx.goTo("https://quotes.toscrape.com/tag/inspirational/");

// wait until 3000 miliseconds or 3 seconds.
await rfx.waitForTimeout(3000);

// open https://quotes.toscrape.com/tag/life/
await rfx.goTo("https://quotes.toscrape.com/tag/life/");
```

## Code Example: Evaluate

```
// open https://quotes.toscrape.com
await rfx.goTo("https://quotes.toscrape.com");

// wait until the selector at the first argument appears.
// timeout = 100
// tries = 300
await rfx.waitForSelector("body > div > div:nth-child(2) > div.col-md-4.tags-box > span:nth-child(7) > a", 100, 300);

// run script at the first argument in right panel context or at the web page from https://quotes.toscrape.com.
let result = await rfx.evaluate(`
    let elements = Array.from(document.querySelectorAll("body > div > div:nth-child(2) > div.col-md-4.tags-box > span:nth-child(7) > a"));
    let textContent = elements.map(element => {
        return element.textContent
    });
    alert(textContent);
    return textContent;
`);
```
