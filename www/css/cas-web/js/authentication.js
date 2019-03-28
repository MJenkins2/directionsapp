function goToMap() {
    location.href = "mapPage.html";
}

function goToLogin() {
    location.href = "loginPage.html";
}

function goBackHome() {
    location.href = "index.html";
}

function eraseCookie(name) {
    createCookie(name, "", -1);
}

function EncodeQueryData(data) {
    var ret = [];
    for (var d in data)
        ret.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
    return ret.join("&");
}

function getPortalURL() {
    var cas = window.location.hostname;
    if (cas === "login.hofstra.edu")
        return "my.hofstra.edu";
    else if (cas === "tlbcas3.hofstra.edu")
        return "mytest3.hofstra.edu";
    else if (cas === "logintest.hofstra.edu")
        return "myupgr.hofstra.edu"
    else
        return "wdevmy.hofstra.edu";
}

function getPwrHost() {
    var cas = window.location.hostname;
    if (cas === "login.hofstra.edu") {
        return "mypassword.hofstra.edu";
    }
    else {
        return "mypasswordtest.hofstra.edu";
    }
}

function resetPassword() {
    location.href = "https://" + getPwrHost();
}

function resetPasswordForgot() {
    location.href = "https://" + getPwrHost() + "/password?reason=forgot";
}

function getLogoutUrls() {
    var cas = window.location.hostname;
    if (cas === "login.hofstra.edu") {
        return [
            "https://xe.hofstra.edu/StudentSSB/ssb/logout",
            "https://hofstraonline.hofstra.edu/pls/HPRO/twbkwbis.P_Logout"
        ];
    }
    else if (cas === "tlbcas3.hofstra.edu") {
        return [
            "https://xetest1.hofstra.edu/StudentSSB/ssb/logout",
            "https://testhofstraonline.hofstra.edu:8010/pls/SAND/twbkwbis.P_Logout"
        ];
    }
    else if (cas === "logintest.hofstra.edu") {
        return ["https://xetest2.hofstra.edu/StudentSSB/ssb/logout",
            "https://testhofstraonline.hofstra.edu:8001/pls/UPGR/twbkwbis.P_Logout"];
    }
    else {
        console.log("getLogoutUrls:  unknown instance");
        return [];
    }
}


function createCookie(name, value) {
    document.cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value) + "; path=/";
}

function delete_cookie(name) {
    document.cookie = name + '=; Domain=.hofstra.edu; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

function validForm(theForm) {
    $("#username-error").css("display", "none");
    $("#password-error").css("display", "none");
    $("#other-errors").css("display", "none");

    if (theForm.find('input[name="username"]').val() == "" || theForm.find('input[name="username"]').val() == null) {
        $("#username-error").css("display", "block");
        $("#username").focus();
        return false;
    } else if (theForm.find('input[name="password"]').val() == "" || theForm.find('input[name="password"]').val() == null) {
        $("#password-error").css("display", "block");
        $("#password").focus();
        return false;
    }
    else {
        return true;
    }
}

//Namespace Package
var hof = { services: {}, helpers: {} };

//=========================================================//
//
//	Services - This is where we are asynchronously posting
//  to different resources to authenticate the user.
//
//=========================================================//
/******************************************************
 * This method is used to sync passwords after login. It
 * must be called after a hofapps authentication, and then
 * will wait for a response before redirecting users to the portal.
 ******************************************************/
hof.services.syncPasswords = function (password) {
    var q = $.Deferred();

    var iframe = document.createElement('iframe');
    var html = '<body><form style="height: 0px; width: 0px" method="post" id="pass" action="https://' + getPortalURL() + '/hofapps/applications/dr-set-crd/index.jsp"><input type="password" name="password" value="' + $("#password").val() + '"></form><script>document.getElementById("pass").submit();</script></body>';
    iframe.src = 'data:text/html;charset=utf-8,' + encodeURI(html);
    iframe.onload = function () {
        q.resolve();
    };
    iframe.height = '0';
    iframe.width = '0';
    document.body.appendChild(iframe);

    return q.promise();
};

/******************************************************
 * Because of sandboxing we need to make a jsonp request
 * in order for ajax to perform the request properly
 * and allow authentication to hofapps
 ******************************************************/

hof.services.authenticateHofapps = function (ticket) {
    var iframe = document.createElement('iframe');
    var url = 'https://' + getPortalURL() + '/hofapps/authenticateUser.jsp';
    iframe.src = url;
    iframe.id = "hofapps-iframe";
    iframe.frameBorder = '0';
    iframe.scrolling = 'no';
    iframe.marginWidth = '0';
    iframe.marginHeight = '0';
    iframe.hspace = '0';
    iframe.vspace = '0';
    iframe.allowTransparency = "true";
    iframe.width = '0';
    iframe.height = '0';
    document.body.appendChild(iframe);

    $('#hofapps-iframe').load(function () {
        portalRedirect(ticket);
    });
    // 	var q = $.Deferred();

    // // JSONP request
    // (function($) {
    // 	var url = 'https://' + getPortalURL() + '/hofapps/authenticateUser.jsp?callback=?';
    // 	console.log("aaaa");
    // 	$.ajax({
    // 		type: 'GET',
    // 		url: url,
    // 		async: false, // True?
    // 		jsonpCallback: 'authenticate',
    // 		//contentType: "application/javascript",
    // 		dataType: 'jsonp',
    // 		timeout: 30000,
    // 		success: function(json) {
    // 			console.log("success");

    // 			q.resolve(json);
    // 		},
    // 		error: function(e) {
    // 			console.log("error");

    // 			q.reject(e);

    // 			$("#other-errors").text("An error has occurred on login");
    // 			$("#other-errors").css("display", "block");
    // 			$("#other-errors").delay(5000).fadeOut();
    // 			$(":submit").attr("disabled", false);
    //            			$(":submit").attr("value", "Submit");
    // 		}
    // 	});
    // })(jQuery);

    // return q.promise();
};

/******************************************************
 * Logic behind posting the user's credentials to the
 * CAS server to retrieve a TGT
 ******************************************************/
hof.services.postCASTicket = function () {
    var q = $.Deferred();

    $.ajax({
        type: "POST",
        url: "/cas-web/v1/tickets",
        data: $("#fm1").serialize(),
        timeout: 30000
    }).success(function (a, b, c) {
        q.resolve(a, b, c);
    }).fail(function (xhr, error) {
        q.reject(xhr, error);

        $('#pleaseWaitDialog').modal('hide');
        $("#username").focus();
        if (xhr.responseText && xhr.responseText.indexOf("AccountLockedException") > -1) {
            //account locked
            var lockedHtml = ''
                + '<div class="alert alert-danger" style="border:3px solid darkred;">'
                + '	<h1 style="text-align:center"><i class="fa fa-lock"></i></h1>'
                + '	<p><strong>Your account has been temporarily locked because of too many failed login attempts.</strong></p>'
                + ' <p><strong>If you do not remember your password, you may <a href="https://' + getPwrHost() + '/password?reason=forgot">change your password</a></strong></p>'
                + '</div>'
                + '';
            $("#login-form").html(lockedHtml);
        } else {
            $("#other-errors").text("Invalid Username or Password");
            $("#other-errors").css("display", "block");
            $("#password").val("");
            $("#password").focus();
            $("#other-errors").delay(5000).fadeOut();
            $(":submit").attr("disabled", false);
            $(":submit").attr("value", "Submit");
        }
    });

    return q.promise();
};

/******************************************************
 * Logic behind posting the user's TGT to the
 * CAS server to retrieve a service ticket
 ******************************************************/
hof.services.postTGTTicket = function (parameterName, parameterValue, action) {
    var q = $.Deferred();

    var parameterName = hof.helpers.getServiceTarget();
    var parameterValue = hof.helpers.getServiceTargetParameter(parameterName);

    var data = {};

    if (parameterName === "target") {
        location.reload();
        // data = {
        // TARGET: parameterValue
        // };

        return q.promise();
    } else {
        data = {
            service: parameterValue
        };

        $.ajax({
            type: "POST",
            url: "/cas-web/v1/tickets/" + action.substr(action.lastIndexOf('/') + 1),
            data: data,
            timeout: 30000
        }).success(function (a, b, c) {
            q.resolve(a, b, c);
        }).fail(function (a, b) {
            q.reject(a, b);
            $('#pleaseWaitDialog').modal('hide');
            $("#other-errors").text("An error has occurred on login");
            $("#other-errors").css("display", "block");
            $("#username").focus();
            $("#other-errors").delay(5000).fadeOut();
            $(":submit").attr("disabled", false);
            $(":submit").attr("value", "Submit");
        });

        return q.promise();
    }
};

/******************************************************
 * Logout of service to which the user might be logged in
 ******************************************************/
hof.services.logoutOfService = function (url) {
    var img = document.createElement("img");
    img.height = "1";
    img.width = "1";
    img.style.border = "none";
    img.src = url;
    img.alt = "";
    document.body.appendChild(img);
};

/******************************************************
 * Logout of all services to which the user might be logged in
 ******************************************************/
hof.services.logoutOfServices = function () {
    getLogoutUrls().forEach(function (url, i, urls) {
        hof.services.logoutOfService(url);
    });
};

//=========================================================//
//
//	Helpers - Helper methods
//
//=========================================================//

/******************************************************
 *	Find URL Parameter
 ******************************************************/
hof.helpers.getUrlParameter = function (sParam) {
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0].toLowerCase() == sParam.toLowerCase()) {
            return sParameterName[1];
        }
    }
};

/******************************************************
 *	Find Service/Target Parameter Value
 ******************************************************/
hof.helpers.getServiceTargetParameter = function (parameterName) {
    return decodeURIComponent(hof.helpers.getUrlParameter(parameterName));
};

/******************************************************
 *	CAS has support for parameters of service or target.
 *	Return which one this client is using
 ******************************************************/
hof.helpers.getServiceTarget = function () {
    if (hof.helpers.getUrlParameter("target"))
        return "target";
    else if (hof.helpers.getUrlParameter("service"))
        return "service";
    else
        return "undefined"
};

//=========================================================//
//
//	Page related functions
//
//=========================================================//

// If the page doesn't have a service/target parameter then default to the portal
if ((hof.helpers.getServiceTarget() === "undefined") && (location.pathname === "/cas-web/login")) {
    var url = location.href + (location.href.indexOf('?') > -1 ? '&' : '?') + EncodeQueryData({ 'service': 'https://' + getPortalURL() + '/c/portal/login' });
    location.replace(url);
}

function portalRedirect(ticket) {
    // Sync Passwords				
    var password = $("#password").val();
    hof.services.syncPasswords(password).then(function () {
        // Redirect user to their service with necessary parameters
        var parameterName = hof.helpers.getServiceTarget();

        window.location = hof.helpers.getServiceTargetParameter(parameterName) + (hof.helpers.getServiceTargetParameter(parameterName).indexOf('?') > -1 ? '&' : '?') + EncodeQueryData({ 'ticket': ticket }) + window.location.hash;
    });
}

// Logic to submit the login form.
function submitForm() {
    $("#username").val($("#username").val().trim());
    $('#pleaseWaitDialog').modal('show');

    // POST to get CAS TGT
    hof.services.postCASTicket().then(function (a, b, c) {
        var action = $(c.responseText).filter('form')[0].action;
        createCookie("CASTGC", action.substr(action.lastIndexOf('/') + 1));

        var parameterName = hof.helpers.getServiceTarget();

        // If we're authenticating against the portal
        if (hof.helpers.getServiceTargetParameter(parameterName).indexOf(getPortalURL()) > 0) {

            // Submit TGT with service/target parameter
            hof.services.postTGTTicket("service", "https://" + getPortalURL() + "/c/portal/login", action).then(function (a, b, c) {

                // Authenticate user to hofapps. Hofapps is authenticated through an iframe, a callback is performed on load to the portal redirect function.
                hof.services.authenticateHofapps(a);
            });
        } else {
            // Redirect user to their service with necessary parameters
            var parameterName = hof.helpers.getServiceTarget();
            var parameterValue = hof.helpers.getServiceTargetParameter(parameterName);
            // Submit TGT with service/target parameter
            hof.services.postTGTTicket(parameterName, parameterValue, action).then(function (a, b, c) {
                window.location = hof.helpers.getServiceTargetParameter(parameterName) + (hof.helpers.getServiceTargetParameter(parameterName).indexOf('?') > -1 ? '&' : '?') + EncodeQueryData({ 'ticket': a }) + window.location.hash;
            });
        }
    });
};


$(document).ready(function () {
    document.cookie = "LUM4COOKIE=EXISTS; path=/;domain=.hofstra.edu; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    delete_cookie("CPSESSID");
    $("#fm1").submit(function (ev) {
        ev.preventDefault();
        if (validForm($("#fm1"))) {
            submitForm();
        }
    });
});

$(document).ready(function () {
    hof.services.logoutOfServices();
    $("#username").focus();
});
