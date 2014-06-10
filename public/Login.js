/**
 * Created by mindtap on 6/9/14.
 */
function LoginClick(){


    {
        window.open('ParticipantLogin.html')/*opens the target page while Id & password matches*/
//        alert("Button was clicked");
    }
//    else
//    {
//        alert("ERROR! what is your name?")/*displays error message*/
//    }
}

//function CheckValidation() {
//
//    var isValidForm = document.forms['REGform'].checkValidity();
//    if(isValidForm)
//    {
//        document.forms['REGform'].submit();
//
//    }
//    else
//    {
//        return false;
//    }
//
//}


function validateForm() {
    var x = document.forms["myForm"]["fname"].value;
    if (x==null || x=="") {
        alert("incomplete form!");
        return false;
    }
}