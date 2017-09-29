'use strict';

function createElement(content) {
    console.log(content)
    let node = document.createElement(content.name)
    for (let key in content.props) {
        node.setAttribute(key, content.props[key]);
    }
    if (content.childs) {
        content.childs.forEach(item => {
            if (typeof(item) == 'string') {
                node.textContent = node.textContent + item;
            }
            let elem = createElement(item);
            node.appendChild(elem);
        })
    }
    //console.log('node', node)
    return node;

}