// ==UserScript==
// @name         Arma Reforger - Workshop JSON Generator
// @version      1.0
// @description  Adds a button to generate and copy mod info JSON
// @author       Slinky
// @match        https://reforger.armaplatform.com/workshop
// @match        https://reforger.armaplatform.com/workshop/*
// @updateURL    https://raw.githubusercontent.com/CallMeSlinky/Arma-Reforger-Workshop-JSON-Generator/main/Arma%20Reforger%20-%20Workshop%20JSON%20Generator-1.0.user.js
// @downloadURL  https://raw.githubusercontent.com/CallMeSlinky/Arma-Reforger-Workshop-JSON-Generator/main/Arma%20Reforger%20-%20Workshop%20JSON%20Generator-1.0.user.js
// @grant        none
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
        wrapper.style.display = 'flex';
        wrapper.style.alignItems = 'center';
        wrapper.style.gap = '8px';

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('stroke-width', '2');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('aria-hidden', 'true');
        svg.setAttribute('class', 'h-5 w-5');
        svg.style.width = '20px';
        svg.style.height = '20px';

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

        button.style.backgroundColor = '#404040';
        button.style.color = 'white';
        button.style.padding = '10px 15px';
        button.style.border = 'none';
        button.style.borderRadius = '4px';
        button.style.cursor = 'pointer';
        button.style.marginTop = '20px';
        button.style.fontFamily = 'Roboto, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"';

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
        const version = versionElement?.textContent?.trim() || 'Not found';

        return {
            modId,
            name,
            version
        };
    }

    function copyToClipboard(text, textSpan) {
        const originalText = textSpan.textContent;

        navigator.clipboard.writeText(text).then(() => {
            textSpan.textContent = 'Copied!';
            setTimeout(() => {
                textSpan.textContent = originalText;
            }, 1000);
        }).catch(err => {
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
            buttonAdded = true;
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
        let currentURL = window.location.href;

        const observer = new MutationObserver(
            debounce((mutations) => {
                for (const mutation of mutations) {
                    if (mutation.type === 'childList') {
                        const container = document.querySelector(containerSelector);
                        if (container) {
                            if (window.location.href !== currentURL) {
                                currentURL = window.location.href;
                                buttonAdded = false;
                                addCopyButton();
                                break;
                            }
                        }
                    }
                }
            }, 300)
        );

        const targetNode = document.querySelector('#__next');
        if (targetNode) {
            observer.observe(targetNode, {
                childList: true,
                subtree: true
            });
        }
    }

    addCopyButton();
    setupObserver();
})();
