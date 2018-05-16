function check_authentication(require_login){
    $("#a-login").html("login");
    $.ajax({
        method: 'GET',
        url: '/is_authenticated/',
        success: function(d) {
            if (d.is_authenticated == true)
                $("#a-login").html("logout");
            else{
                console.log("Not logged in.")
                if(require_login)
                    $('#popup-login').modal('show');
            }
        },
        error: function(d) {
            console.log("Something went wrong on logging out.")
        }
    });
}

function authenticate_user(){
    event.preventDefault();
    $.ajax({
        method: 'POST',
        url: '/login_ajax/',
        data: $('#loginForm').serialize(),
        success: function(d) {
            $("#loginError").html("");
            if (d.success == true) {
                $("#a-login").html("logout");
                $('#popup-login').modal('hide');
                show_popup_alert("logged in", "Successfully Logged into access all the apps")
            } else {
                $("#loginError").html("Sorry, looks like that username and password combination isn’t quite right. Please re-enter your details and try again.");
            }
        },
        error: function(d) {
            // console.log(d);
            $("#loginError").html("Sorry, looks like that username and password combination isn’t quite right. Please re-enter your details and try again.");
        }
    });
}

$(document).ready(function() {
    $('#popup-login').on('hidden.bs.modal', function (e) {
        if($("#a-login").html().toLowerCase() == "login"){
            window.location.href = "/";
        }
    });

});


function alternate_login(){
    var login_state = $("#a-login").html().toLowerCase();
     if(login_state == "login"){
        $('#popup-login').modal('show');
     }
     else{
        $.ajax({
            method: 'GET',
            url: '/logout_ajax/',
            success: function(d) {
                if (d.success == true) {
                    window.location.href = "/";
                    $("#a-login").html("login");
                }
                else
                    console.log("Error on logging out.")
            },
            error: function(d) {
                console.log("Somethig went wrong on logging out.")
            }
        });
     }
}

function show_popup_alert(alert_title, alert_disc)
{
	$("#alert_title").html(alert_title);
	$("#alert_disc").html(alert_disc);
	$('#popup-alert').modal({
     	show: 'true'
    });
}

// function test(){
//     console.log("fdfdf");
//     event.preventDefault();
//     $.ajax({
//         method: 'POST',
//         url: '/login_ajax/',
//         data: $('#loginForm').serialize(),
//         success: function(d) {
//             $("#loginError").html("");
//             if (d.success == true) {
//                 $("#a-login").html("logout");
//                 console.log($("#a-login").html());
//                 window.close();
//             } else {
//                 $("#loginError").html("Sorry, looks like that username and password combination isn’t quite right. Please re-enter your details and try again.");
//             }
//         },
//         error: function(d) {
//             // console.log(d);
//             $("#loginError").html("Sorry, looks like that username and password combination isn’t quite right. Please re-enter your details and try again.");
//         }
//     });
// }
