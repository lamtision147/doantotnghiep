var express = require("express");
var app = express();
app.use(express.static("public"));
app.set("view engine","ejs");
app.set("views", "./views");
var mobile = require('is-mobile');
var nodemailer = require('nodemailer');

var datasensor = require('./data/data');
var mongoose = require('mongoose');
const db = 'mongodb+srv://phuongvu2:nhutren0985@cluster0.bhksc.gcp.mongodb.net/datasensor?retryWrites=true&w=majority';
mongoose.connect(db ,{useUnifiedTopology: true,useNewUrlParser: true},(err)=>{
    if(!err){console.log('Ket noi mongoDB thanh cong');}
    else{console.log('Loi khong ket noi duoc mongoDB: '+ err);}
});

const Vonage = require('@vonage/server-sdk')

const vonage = new Vonage({
  apiKey: "80134f36",
  apiSecret: 'I54KszcJpr1L282w',
  applicationId: "10da0425-cf1c-4d45-9fcb-847b056dbe80",
  privateKey: 'private.key'
})

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'nhien0985@gmail.com',
    pass: 'nhutren0985'
  }
});

var server = require("http").Server(app);
var io= require("socket.io")(server);
server.listen(process.env.PORT || 3000);


var serialport = require("serialport");
var port = new serialport('COM5',{
baudRate:9600,
//parser:serialport.parsers.readline("\n")
});


var manguser=["ABC"];
io.on("connection", function(socket){
  console.log("co nguoi vua ket noi: " + socket.id);

  socket.on("client_send_Username", function(data){
    if(manguser.indexOf(data)>=0){
      //fail
      socket.emit("server_send_dki_fail");
    }
    else{
      //thanhcong
      manguser.push(data);
      socket.Username = data;
      socket.emit("server_send_dki_thanhcong", data);
      io.sockets.emit("server_send_all", manguser);
    }
  });

  socket.on("client_click_logout", function(){
    manguser.splice(manguser.indexOf(socket.Username),1);
    socket.broadcast.emit("server_send_all", manguser);
  });
  socket.on("disconnect", function () {
    manguser.splice(manguser.indexOf(socket.Username), 1);
    socket.broadcast.emit("server-send-danhsach-User",manguser);

   });

  socket.on("user_send_message", function(data){
    io.sockets.emit("server_send_chat_all", {un:socket.Username,nd:data});
  });

  socket.on("writting", function(){
    var s = socket.Username + " is writting...";
    socket.broadcast.emit("someone_writting", s);
  });
  socket.on("stopwritting", function(){
    var s = "";
    socket.broadcast.emit("someone_stopwritting", s);
  });

});
app.get("/home", function(req, res){
  res.render("trangchu");

  const Readline=serialport.parsers.Readline;
  const parser=new Readline();port.pipe(parser);
  parser.on("open",onPortOpen);
  parser.on("data",onData);
  parser.on("close",onClose);
  parser.on("error",onError);

  function onPortOpen(){ console.log("port Open");}
  function onData(data2){

    var chuoiNhietDo = data2.slice(0,17);
    var chuoiDoAmDat = data2.slice(18,34);
    var chuoiDat = data2.slice(36,68);
    var chuoiAS = data2.slice(68,95);
    var chuoiDoCaoMucNuoc = data2.slice(95,120);


    //var chuoiDat = data2.substr()
    console.log(chuoiNhietDo);
    console.log(chuoiDoAmDat);
    console.log(chuoiDat);
    console.log(chuoiAS);
    console.log(chuoiDoCaoMucNuoc);

    var resatlo = "Canh bao sat lo";
    var catchuoi2 = data2.match(resatlo);

    var nhietdo = "Nhiet do";
    var catchuoinhietdo = data2.match(nhietdo);

    console.log("data received: "+ data2);
    io.sockets.emit("server_send_sensor_all", chuoiNhietDo );
    io.sockets.emit("server_send_sensor_all", chuoiDoAmDat );
    io.sockets.emit("server_send_sensor_all", chuoiDat );
    io.sockets.emit("server_send_sensor_all", chuoiAS );
    io.sockets.emit("server_send_sensor_all", chuoiDoCaoMucNuoc );


    //io.sockets.emit("server_send_chuoiDat", chuoiDat );
    var tinhtrang = "sat lo";
    var datbt = chuoiDat.match(tinhtrang);
    var kqdatbth = "Bình Thường";
    var kqdatsatlo = "Đang Sạt Lở";
    if(datbt != "sat lo"){
      io.sockets.emit("server_send_chuoiDat", "Bình Thường" );
    }
    else{
      io.sockets.emit("server_send_chuoiDat", "Đang Sạt Lở" );
    }

    //var chuoiSonhietDo = chuoiNhietDo;
    //var soNhietDo = chuoiSonhietDo.match(/\d/g);
    var haiSoDau = chuoiNhietDo.slice(10,15);
    //var haiSoCuoi = soNhietDo.slice(2,3);
    var kqNhietDo = haiSoDau + " C";
    io.sockets.emit("server_send_chuoiNhietDo", kqNhietDo );

    var soDoAmDat = chuoiDoAmDat.slice(11,13);
    var kqDoAmDat = soDoAmDat + " %";
    io.sockets.emit("server_send_chuoiDoAmDat", kqDoAmDat );

    const sensor = new datasensor();
    sensor.nhietdo = chuoiNhietDo;
    sensor.doamdat = chuoiDoAmDat;
    sensor.tinhtrangdat = chuoiDat;
    sensor.apsuattrong = chuoiAS;
    sensor.docaomucnuoc = chuoiDoCaoMucNuoc;
    sensor.save();

    var mailOptions = {
      from: 'nhien0985@gmail.com',
      to: 'nhien0985@gmail.com',
      subject: 'Thông báo sạt lở đất!!!!',
      text: 'Đã có sạt lở đất tại khu vực, hãy tiến hành di tản ngay lập tức!!!'
    };

    var mailOptions2 = {
      from: 'nhien0985@gmail.com',
      to: 'nhien0985@gmail.com',
      subject: 'Thông báo độ ẩm đất cao, có khả năng sạt lở đất!!!',
      text: 'Độ ẩm trong đất đang là:'+ kqDoAmDat + ', có khả năng sạt lở rất cao, hãy bắt đầu di tản và cảnh báo cho người dân!!!'
    };
    var mailSoNhietDo = chuoiDoAmDat.replace(/[^\d]/g, '');
    if(mailSoNhietDo <= 40 ){

    }
    else {
      transporter.sendMail(mailOptions2, function(error, info){
        if (error) {
          console.log(error);
        }else {
          console.log("Đã gửi mail cảnh báo đến: nhien0985@gmail.com");
          }
        });
      }

    if(catchuoi2 != "Canh bao sat lo" ){
      //console.log("Tinh trang binh thuong");
    }
    else {
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log("Đã gửi mail cảnh báo đến: nhien0985@gmail.com");
            }
          });
          vonage.calls.create({
            to: [{
              type: 'phone',
              number: "84983048004"
            }],
            from: {
              type: 'phone',
              number: "84983048004"
            },
            ncco: [{
              "action": "talk",
              "text": "Hello Phuong Vu, there is a landslide happening, evacuate now"
            }]
          }, (error, response) => {
            if (error) console.error(error)
            if (response) console.log("Đang thực hiện cuộc gọi")
          });
    }


  }
  function onClose(){console.log("port Closed");}
  function onError(){console.log("something went wrong in serial communication");}
});
