// ==UserScript==
// @name         Arma Reforger - Workshop JSON Generator
// @version      1.0.2
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

    function fetchLatestVersion() {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: 'GET',
                url: 'https://reforger.armaplatform.com/_next/data/lwAgul8pwxQI5Vgx86mpl/dev-hub.json',
                onload(response) {
                    try {
                        const data = JSON.parse(response.responseText);
                        const version = data?.pageProps?.version;
                        if (version) {
                            resolve(version);
                        } else {
                            reject(new Error('Failed to find the version in the JSON.'));
                        }
                    } catch (error) {
                        reject(error);
                    }
                },
                onerror: reject,
            });
        });
    }

    function getCurrentVersion() {
        const currentGameVersionElement = Array.from(document.querySelectorAll('dt'))
            .find(dt => dt.textContent.trim() === 'Game Version')
            ?.parentElement?.querySelector('dd');
        return currentGameVersionElement?.textContent?.trim() || 'Unknown';
    }

    function addWarningElement(latestVersion) {
        const currentGameVersionElement = Array.from(document.querySelectorAll('dt'))
            .find(dt => dt.textContent.trim() === 'Game Version');
        if (!currentGameVersionElement) return;

        const existingWarning = currentGameVersionElement.parentElement.querySelector('.version-warning');
        if (existingWarning) existingWarning.remove();

        const warning = document.createElement('span');
        warning.className = 'version-warning';
        warning.style.cssText = 'display: flex; align-items: center; gap: 4px; background-color: #e2a750; color: #fff; padding: 2px 8px; border-radius: 12px; font-size: 12px; margin-left: 8px; cursor: pointer; font-family: Roboto, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"';

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        svg.setAttribute('width', '16');
        svg.setAttribute('height', '16');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', '2');
        svg.setAttribute('stroke-linecap', 'round');
        svg.setAttribute('stroke-linejoin', 'round');
        svg.setAttribute('class', 'lucide lucide-triangle-alert');
        svg.innerHTML = '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>';

        const text = document.createElement('span');
        text.textContent = 'Outdated';

        warning.appendChild(svg);
        warning.appendChild(text);
        warning.title = `Latest game version: ${latestVersion} - This mod may be incompatible.`;

        currentGameVersionElement.appendChild(warning);
        currentGameVersionElement.style.cssText = 'display: flex; align-items: center;';
    }

    async function checkGameVersion() {
        try {
            const latestVersion = await fetchLatestVersion();
            const currentVersion = getCurrentVersion();
            if (latestVersion && currentVersion !== latestVersion) {
                addWarningElement(latestVersion);
            }
        } catch (error) {
            console.error('Error checking game version:', error);
        }
    }

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
        const version = versionElement?.textContent?.trim() || 'Not found';

        return { modId, name, version };
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
                        checkGameVersion();
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
        checkGameVersion();
        addCopyButton();
    }

    setupObserver();
})();
