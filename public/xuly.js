
var socket = io("http://localhost:3000");
//var socket = io("https://doantotnghiep99.herokuapp.com");
socket.on("server_send_dki_fail", function(){
  alert("Tên đã sử dụng !!!");
});

socket.on("server_send_all", function(data){
  $("#boxContent").html("");
  data.forEach(function(i){
    $("#boxContent").append("<div class='user'>" + i +"</div>");
  });
});

socket.on("server_send_dki_thanhcong", function(data){
  $("#currentUser").html(data);
  $("#loginform").hide(2000);
  $("#chatform").show(1000);
});

socket.on("server_send_sensor_all" , function (data2){
  $("#listMessage").prepend("<div class='ms'   >" + data2 +"</div>");
});

socket.on("server_send_chuoiDat", function(data3){
  $("#btnChuoiDat").html(data3);

  var xa = "Đang Sạt Lở";
  var catchuoiDat = data3.match(xa);
  if(catchuoiDat != "Đang Sạt Lở"){
    document.getElementById("btnChuoiDat").style.backgroundColor = "blue";
  }
  else{
    document.getElementById("btnChuoiDat").style.backgroundColor = "red";
  }
});

socket.on("server_send_chuoiNhietDo", function(data4){
  $("#btnChuoiNhietDo").html(data4);
});

socket.on("server_send_chuoiDoAmDat", function(data5){
  $("#btnChuoiDoAmDat").html(data5);
  var soNhietDo = data5.replace(/[^\d]/g, '');
  if(soNhietDo <= 40 ){
    document.getElementById("btnChuoiDoAmDat").style.backgroundColor = "blue";
  }
  else{
    document.getElementById("btnChuoiDoAmDat").style.backgroundColor = "red";
  }
});

socket.on("server_send_chat_all" , function(data){
  $("#listMessage").append("<div class='ms'>" + data.un +" : "+data.nd +"</div>")
});

socket.on("someone_writting", function(data){
    $("#thongbaowritting").html(data + "<img width='30px' src='typing01.gif' />" );
});

socket.on("someone_stopwritting", function(data){
    $("#thongbaowritting").html(data);
});





$(document).ready(function(){
  $("#loginform").show();
  $("#chatform").hide();
  $("#btnRegister").click(function(){
    socket.emit("client_send_Username", $("#txtUsername").val());
  });
  $("#btnLogOut").click(function(){
    socket.emit("client_click_logout");
    $("#loginform").show(2000);
    $("#chatform").hide(1000);
  });
  $("#btnSendMessage").click(function(){
    socket.emit("user_send_message", $("#txtMessage").val());
  });
  $("#txtMessage").focusin(function(){
    socket.emit("writting");
  });
  $("#txtMessage").focusout(function(){
    socket.emit("stopwritting");
  });


  if (window.navigator.userAgent.indexOf("Mobile") > -1) {
      // HIDING ELEMENTS
      $("#loginform").hide(1000);
      $("#chatform").show(2000);
  }
});
