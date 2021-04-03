// 主要功能

var socket=io('http://localhost:3000')
var username

// 回车登录
var app = new Vue({
    el:".form",
    methods: {
        login:function(){
            var username = $('.usernameInput').val().trim()
            if(!username){
                alert('请输入用户名')
                return
            }
            console.log('登录函数执行')
            console.log(username)
            // 返回数据给浏览器
            socket.emit('login',{
                username:username,
            })
        },

    },
})
// 发送消息
var app2 = new Vue({
    el:".inputMessage",
    methods:{
        send:function(){
            var content = $('.inputMessage').html()
            $('.inputMessage').html('')
            if(!content) return alert('请输入内容')
            //发送给服务器
            socket.emit('sendMessage',{
                msg:content,
                username:username
            })
        }
    },
})
// contenteditable 禁止生成div
$('.inputMessage').keydown(function(e) {
    if (e.keyCode === 13) {
        document.execCommand('insertHTML', false, '');
        return false;
    }
});

// 监听登录失败
socket.on('loginError',data=>{
    alert('登录失败')
})

socket.on('loginSuccess',data=>{
    // alert('登录成功')
    // 需要显示聊天窗口
    //隐藏登录窗口
    $(".login ").fadeOut();
    $(".chat").fadeIn()
    
    username= data.username
})
//添加用户的消息
socket.on('addUser',data => {
    console.log(data)
    $('.messages').append(`
    <li class="log" style="display: list-item">
    ${data.username} joined
    </li>
    `)
    scrollIntoView()
})

//监听用户列表的消息
socket.on('userList',data=>{
    // console.log(data)
    $('.users').html('')
    data.forEach(item =>{
        
        $('.users').append(`
        <li class="user">
            <div class="name">${item.username}</div>
        </li>
        `)
    })

    $('.userCount').text('在线人数:'+data.length)
})

//添加离开的消息
socket.on('delUser',data => {
    console.log(data)
    $('.messages').append(`
    <li class="log" style="display: list-item">
    ${data.username} leaved
    </li>
    `)
    scrollIntoView()
})

//监听聊天的消息
socket.on('receiveMessage',data =>{
    console.log(data.msg)
    if(data.username === username){
        // 自己的消息
        $('.messages').append(`
        <li class="message" style="display: list-item;">
            <span class="username" style="color: rgb(59, 136, 235);">${data.username}</span>
            <span class="messageBody">${data.msg}</span>
        </li>
        `)
    }else{
        // 别人的消息
        $('.messages').append(`
        <li class="message" style="display: list-item;">
        <span class="username" style="color: rgb(56, 36, 170);">${data.username}</span>
        <span class="messageBody">${data.msg}</span>
    </li>
        `)
    }
    scrollIntoView()
})

function scrollIntoView(){
     //当前元素底部
     $('.messages').
     children(':last').
     get(0).scrollIntoView(false)
}

// 发送图片功能
$('#file').on('change',function(){
    var file = this.files[0]
    
    //发送到服务器上
    var fr = new FileReader()
    fr.readAsDataURL(file)
    fr.onload = function() {
        socket.emit('sendImage',{
            username:username,
            img:fr.result
        })
    }
})

//监听图片聊天
socket.on('receiveImage',(data) =>{
    console.log(data)
    if(data.username === username){
        // 自己的消息
        $('.messages').append(`
        <li class="message" style="display: list-item;">
            <span class="username" style="color: rgb(59, 136, 235);">${data.username}</span>
            <span class="messageBody">
                <img width="30%" height="30%" src="${data.img}">
            </span>
        </li>
        `)
    }else{
        // 别人的消息
        $('.messages').append(`
        <li class="message" style="display: list-item;">
        <span class="username" style="color: rgb(56, 36, 170);">${data.username}</span>
        <span class="messageBody"><img width="30%" height="30%" src="${data.img}"></span>
    </li>
        `)
    }

    //等待图片加载完成
    $('.message img:last').on('load',function(){
        scrollIntoView()
    })
    
})

//初始化jquery-emoji插件
$('.icon-emoji').on('click',function(){
    console.log('11')
    $('.inputMessage').emoji({
        //设置触发表情按钮
        button:'.icon-emoji',
        showTab:true,
        animation:'fade',
        position:'topRight',
        icons:[
             {
                 name:'QQ表情',
                 path:'../lib/jquery-emoji/img/qq/',
                 maxNum:91,
                 excludeNums:[100,100,100],
                 file:'.gif'
             }
        ]
    })
})

