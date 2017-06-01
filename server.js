var logger=require('morgan');
var http=require('http');
var bodyParser=require('body-parser');
var express=require('express');
var router=express();

var app=express();
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended:false
}));

var server=http.createServer(app);
var request=require('request');

app.get('/',(req,res)=>{
	res.send("Home page. Server is running okay");
});

app.get('/webhook',function(req,res){
	if(req.query['hub.verify_token']===''){
		res.send(req.query['hub.challenge']);
	}

	res.send('Error, wrong validation token');

});

app.post('/webhook',function(req,res){
	var entries=req.body.entry;
	for(var entry of entries){
		var messaging=entry.messaging;
		for(var message of messaging){
			var sendId=message.sender.id;
			if(message.message){
				if(message.message.text){
					var text=message.message.text;
					console.log(text);
					sendMessage(senderId,"");
				}
			}
		}
	}

	res.status(200).send("OK");

});

function sendMessage(senderId, message){
	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs:{
			access_token:"token",
		},
		method:'POST',
		json:{
			recipient:{
				id:senderId
			},
			message:{
				text:message
			},
		}
	});
}

app.set('port',process.env.OPENSHIFT_NODEJS_PORT||process.env.PORT||3002);
app.set('ip',process.env.OPENSHIFT_NODEJS_IP||process.env.IP||"127.0.0.1");

server.listen(app.get('port'), app.get('ip'), function(){
	console.log("Chat bot server is listening at %s:%d",app.get('ip'),app.get('port'));
});