/**
 * Created by mindtap on 6/9/14.
 */



function validateForm() {
    var x = document.forms["myForm"]["fname"].value;
    if (x==null || x=="") {
        alert("incomplete form!");
        return false;
    }
}