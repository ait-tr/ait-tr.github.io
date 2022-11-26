    const converter = new showdown.Converter();
    const urlParams = new URLSearchParams(document.location.search);

    const queryDict = {};
    queryDict.lessonParts = ['plan', 'theory', 'homework', 'code']  // List of parts should be show
    queryDict.mianURL = urlParams.get('file');                      // url to metadata.json file
    queryDict.baseUrl = queryDict.mianURL.split("metadata.json")[0];
    
    const partContainer = document.querySelector('#lessons');
    const partTemplate = document.querySelector('#part-template');
    const codeTemplate = document.querySelector('#code-template');

    fetchLessonParts(queryDict.mianURL, 'json').then(metadataJSON => {
        renderParts(metadataJSON);
    });

    function renderParts(metadata) {
        queryDict.lessonParts.forEach((part, i) => {
            if (metadata[part]) {
                const partBlock = partTemplate.content.cloneNode(true);
                if (i === 0) partBlock.querySelector('details').open = true; // Open first part of lesson
                partBlock.querySelector('.part__header').textContent = part;
                partBlock.querySelector('.part__content').id = part;

                if (part === 'code') { // fetch and render blocks of code
                    metadata[part].forEach(codePath => {
                        const progLang = codePath.split('.').at(-1);
                        const codeBlock = codeTemplate.content.cloneNode(true);
                        const codeBlockHeader = codeBlock.querySelector('.part__code-header');
                        const codeBlockCode = codeBlock.querySelector('pre code');

                        codeBlockCode.classList.add(`language-${progLang}`);
                        codeBlockHeader.textContent = codePath;
                        partBlock.querySelector('.part__content').appendChild(codeBlock);
                        fetchAndRenderPart(queryDict.baseUrl + codePath, codeBlockCode, progLang);
                    });
                } else {
                    fetchAndRenderPart(queryDict.baseUrl + metadata[part], partBlock.getElementById(part));
                }

                partContainer.appendChild(partBlock);
            }
        });
    }

    function fetchAndRenderPart(path, el, code) {
        fetchLessonParts(path).then((text) => {
            if (code) {
                el.textContent = text;
                hljs.highlightElement(el);
            } else {
                el.innerHTML = converter.makeHtml(text);
            }
        });
    }

    async function fetchLessonParts(url, json) {
        const resp = await fetch(url);
        return await json ? resp.json()  : resp.text();
    }