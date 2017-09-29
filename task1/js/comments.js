'use strict';
var div = document.createElement('div');

function showComments(list) {
    const commentsContainer = document.querySelector('.comments');
    //const comments = list.map(createComment).join('');



    list.forEach(function(comment) {
        console.log(list)
        let commentObj = {
            tag: 'div',
            attr: { class: 'comment-wrap' },
            text: '',
            children: [{
                    tag: 'div',
                    attr: {
                        class: 'photo',
                        title: comment.author.name
                    },
                    children: [{
                        tag: 'div',
                        attr: {
                            class: 'avatar',
                            style: `background-image: url(${comment.author.pic})`
                        }
                    }]
                },
                {
                    tag: 'div',
                    attr: {
                        class: 'comment-block'
                    },
                    text: comment.text,
                    children: [{
                            tag: 'p',
                            attr: {
                                class: 'comment-text',
                                text: comment.text.split('\n').join('<br>')
                            }
                        },
                        {
                            tag: 'div',
                            attr: {
                                class: 'bottom-comment'
                            },
                            children: [{
                                    tag: 'div',
                                    attr: {
                                        class: 'comment-date'
                                    },
                                    text: new Date(comment.date).toLocaleString('ru-Ru')
                                },
                                {
                                    tag: 'ul',
                                    attr: {
                                        class: 'comment-actions'
                                    },
                                    //text: comment.text,
                                    children: [{
                                            tag: 'li',
                                            attr: {
                                                class: 'complain'
                                            },
                                            text: 'Пожаловаться'
                                        },
                                        {
                                            tag: 'li',
                                            attr: {
                                                class: 'reply'
                                            },
                                            text: 'Ответить'
                                        }
                                    ]
                                }
                            ]
                        }

                    ]
                }

            ]
        }
        console.log(makeCmd(commentObj));
        commentsContainer.appendChild(makeCmd(commentObj));
    });

    //commentsContainer.appendChild(comments);
}

function createComment(comment) {
    console.log(comment);
    return `<div class="comment-wrap">
    <div class="photo" title="${comment.author.name}">
      <div class="avatar" style="background-image: url('${comment.author.pic}')"></div>
    </div>
    <div class="comment-block">
      <p class="comment-text">
        ${comment.text.split('\n').join('<br>')}
      </p>
      <div class="bottom-comment">
        <div class="comment-date">${new Date(comment.date).toLocaleString('ru-Ru')}</div>
        <ul class="comment-actions">
          <li class="complain">Пожаловаться</li>
          <li class="reply">Ответить</li>
        </ul>
      </div>
    </div>
  </div>`
}

function makeCmd(obj) {
    let node = document.createElement(obj.tag);
    if (obj.text) {
        node.textContent = obj.text;
    }
    if (obj.attr) {
        for (let key in obj.attr) {
            node.setAttribute(key, obj.attr[key]);
        }
    }
    if (obj.children) {
        obj.children.forEach(item => {
            let elem = makeCmd(item);
            node.appendChild(elem);
        });
    }
    return node;
}

fetch('https://neto-api.herokuapp.com/comments')
    .then(res => res.json())
    .then(showComments);