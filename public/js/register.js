$('#exampleModal').on('show.bs.modal', function (event) {
   var button = $(event.relatedTarget) // Button that triggered the modal
   var recipient = button.data('whatever') // Extract info from data-* attributes
   // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
   // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
   var modal = $(this)
   modal.find('.modal-title').text('New message to ' + recipient)
   modal.find('.modal-body input').val(recipient)
})

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