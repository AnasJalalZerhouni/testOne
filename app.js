const mongo = require('mongodb').MongoClient;
const client = require('socket.io').listen(4000).sockets;

const uri = "mongodb+srv://HamidaBatista:TrayWay@cp23.zlhhc.mongodb.net/mongochat?retryWrites=true&w=majority";


//const clientt = new mongo(uri, { useNewUrlParser: true });


//connect to mongo
mongo.connect(uri, function (err, clientt) {
    if (err) {
        throw err;
    }

    console.log('MongoDB connected...');

    //connect to socket.io
    client.on('connection', function (socket) {
        const db = clientt.db('mongochat');
        
        let chat = db.collection('chats');

        // Create function to send status
        sendStatus = function (s) {
            socket.emit('status', s);
        }
        
        //console.log(chat.find({}).toArray().length);
       

        //get chats from mongo collection
        chat.find({}).toArray(function (err,res) {
            if (err) {
                throw err;
            }
            
            //emit message
            socket.emit('output',res);
        });
        
        socket.on('input',function(data){
            let name = data.name;
            let message = data.message;
            
            //check for name and message
            if(name == '' || message ==''){
                //send error status
                sendStatus('please enter a name and a message');
            }else{
                //insert message
                chat.insert({name:name,message:message},function(){
                    client.emit('output',[data]);
                    
                    //send status object
                    sendStatus({
                       message:'message sent' ,
                        clear:true
                    });
                });
            }
        }); 
            
    });
});
