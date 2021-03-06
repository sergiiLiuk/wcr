 // Change row type to Input type on edit button click
$(document).on("click", ".edit", function () {
   $(this).parents("tr").find("td.editable").each(function () {
         $(this).html('<input type="text" class="form-control" value="' + $(this).text() + '">');
   });
   $(this).parents("tr").find(".add, .edit").toggle();
});

// Confirm changes on add button click
$(document).on("click", ".add", function () {
   var username = $(this).parents("tr").find('td:eq( 0 ) input');
   var password = $(this).parents("tr").find('td:eq( 1 ) input');

   if (checkForErrors(username) && checkForErrors(password)) {
         /*$.ajax({
            url: 'server/server.php',
            method: 'POST',
            dataType: 'text',
            data: {
               add_extra_row: 1,
               nPropertyValue: propVal.val().trim(),
               propertyClassName: propName.val().trim(),
               customerName: customerName
            },
            success: function (data) {
               alert(data);
               getData();
            }
         });*/
         $(this).parents("tr").find('td:eq( 0 )').text(username.val());
         $(this).parents("tr").find('td:eq( 1 )').text(password.val());
         $(this).parents("tr").find(".add, .edit").toggle();
   }


});

// Display input field error, if it is empty
function checkForErrors(caller) {
   if (caller.val() == '') {
         caller.css('border', '2px solid red');
         return false;
   } else
         caller.css('border', '');

   return true;
}