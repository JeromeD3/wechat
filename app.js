var app =require('express')()
var server = require('http').Server(app)
var io =require('socket.io')(server)
//记录所有已经登录过的用户
const users = []
//当前连接上来总的用户数量
let count = 0
server.listen(3000 ,() =>{
    console.log('服务器启动成功')
})

app.use(require('express').static('public'))
app.get('/',function(req,res){
    res.redirect('/index.html')
})

io.on('connection',function(socket){
    socket.on('login', data =>{
        // console.log(data)
        // 判断用户是否存在
        let user =users.find(item => item.username === data.username)
        if(user) {
            socket.emit('loginError',{msg:'登录失败'})
            // console.log('登录失败')
        }else{
            users.push(data)
            // 登录成功 
            socket.emit('loginSuccess',data)
            // console.log('登录成功')
            // 告诉用户有用户进来了
            io.emit('addUser',data)
            //告诉所有的用户，目前聊天室有多少人
            io.emit('userList',users)
            // 保存成功登录的用户名
            socket.username = data.username
            
        }
    })

    //用户断开
    socket.on('disconnect', () => {
        //当前用户信息从users中断开
        // 告诉有人离开了聊天室
        let idx=users.findIndex(item => item.username === socket.username)
        // 删除断掉连接的这个人
        users.splice(idx,1)
        io.emit('delUser',{
            username:socket.username
        })
        // 重新刷新
        io.emit('userList',users)
    })

    //聊天的消息
    socket.on('sendMessage',data => {
        console.log(data)
        //广播给所有用户
        io.emit('receiveMessage',data)
    })

    //接受图片信息
    socket.on('sendImage',data =>{
        //广播给所有用户

        io.emit('receiveImage',data)
    })
})
