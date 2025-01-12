// ==UserScript==
// @name         Arma Reforger - Workshop JSON Generator
// @version      1.0.3
// @description  Adds a button to generate and copy mod info JSON and checks game version compatibility
// @author       Slinky
// @match        https://reforger.armaplatform.com/workshop
// @match        https://reforger.armaplatform.com/workshop/*
// @updateURL    https://raw.githubusercontent.com/CallMeSlinky/Arma-Reforger-Workshop-JSON-Generator/main/Arma%20Reforger%20-%20Workshop%20JSON%20Generator.user.js
// @downloadURL  https://raw.githubusercontent.com/CallMeSlinky/Arma-Reforger-Workshop-JSON-Generator/main/Arma%20Reforger%20-%20Workshop%20JSON%20Generator.user.js
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function () {
    'use strict';

    let buttonAdded = false;
    let currentURL = window.location.href;
    const containerSelector = '#__next > div > main > div > section > div.flex.flex-col.gap-y-4.lg\\:grid.lg\\:grid-cols-3.lg\\:grid-rows-3.lg\\:gap-x-10 > div.flex.flex-col.space-y-8.lg\\:col-start-3.lg\\:col-end-4.lg\\:row-span-3 > dl';
    const nameSelector = 'main > div > section > h1';

    function createCopyButton() {
        const button = document.createElement('button');
        const wrapper = document.createElement('div');
        wrapper.style.cssText = 'display: flex; align-items: center; gap: 8px;';

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('stroke-width', '2');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('aria-hidden', 'true');
        svg.setAttribute('class', 'h-5 w-5');
        svg.style.cssText = 'width: 20px; height: 20px;';

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('stroke-linejoin', 'round');
        path.setAttribute('d', 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2');

        svg.appendChild(path);

        const textSpan = document.createElement('span');
        textSpan.textContent = 'Copy Mod Info as JSON';

        wrapper.appendChild(svg);
        wrapper.appendChild(textSpan);
        button.appendChild(wrapper);

        button.style.cssText = 'background-color: #404040; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer; margin-top: 20px; font-family: Roboto, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"';

        button.addEventListener('mouseover', () => {
            button.style.backgroundColor = '#525252';
            svg.style.transform = 'rotate(-4deg)';
            svg.style.transition = 'transform 0.2s ease';
        });

        button.addEventListener('mouseout', () => {
            button.style.backgroundColor = '#404040';
            svg.style.transform = 'rotate(0deg)';
        });

        return { button, textSpan };
    }

    function getModInfo() {
        const modIdElement = Array.from(document.querySelectorAll('dt'))
            .find(dt => dt.textContent.trim() === 'ID')
            ?.parentElement?.querySelector('dd span');

        const versionElement = Array.from(document.querySelectorAll('dt'))
            .find(dt => dt.textContent.trim() === 'Version')
            ?.parentElement?.querySelector('dd');

        const name = document.querySelector(nameSelector)?.textContent.trim();
        const modId = modIdElement?.textContent?.trim() || 'Not found';

        return { modId, name };
    }

    function copyToClipboard(text, textSpan) {
        const originalText = textSpan.textContent;
        navigator.clipboard.writeText(text)
            .then(() => {
                textSpan.textContent = 'Copied!';
                setTimeout(() => {
                    textSpan.textContent = originalText;
                }, 1000);
            })
            .catch(err => {
                console.error('Failed to copy:', err);
                textSpan.textContent = 'Failed to copy!';
                setTimeout(() => {
                    textSpan.textContent = originalText;
                }, 1000);
            });
    }

    function addCopyButton() {
        if (buttonAdded) return;

        const existingButtons = document.querySelectorAll('[data-copy-mod-info]');
        existingButtons.forEach(button => button.remove());

        const container = document.querySelector(containerSelector);
        if (container) {
            const { button, textSpan } = createCopyButton();
            button.setAttribute('data-copy-mod-info', 'true');

            button.addEventListener('click', () => {
                const modInfo = getModInfo();
                const jsonString = JSON.stringify(modInfo, null, 4);
                copyToClipboard(jsonString, textSpan);
            });

            container.appendChild(button);
        }
    }

    function debounce(func, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    function setupObserver() {
        const observer = new MutationObserver(
            debounce((mutations) => {
                const newURL = window.location.href;
                const container = document.querySelector(containerSelector);

                if (newURL !== currentURL) {
                    currentURL = newURL;
                    buttonAdded = false;
                }

                if (container && /^https:\/\/reforger\.armaplatform\.com\/workshop\/[^\/]+$/.test(newURL)) {
                    if (!buttonAdded) {
                        addCopyButton();
                        buttonAdded = true;
                    }
                }
            }, 300)
        );

        const targetNode = document.querySelector('#__next');
        if (targetNode) {
            observer.observe(targetNode, { childList: true, subtree: true });
        }
    }

    if (/^https:\/\/reforger\.armaplatform\.com\/workshop\/[^\/]+$/.test(window.location.href)) {
        addCopyButton();
    }

    setupObserver();
})();
