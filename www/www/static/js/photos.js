//<script>
//## Require label_image_utils
Dropzone.autoDiscover = false;
var SELECTED_CLASSIFIERS = ["photos"];
var RES_COUNT = 0;
$(function() {
    var drop = new Dropzone("#tmv-dropzone",
        {
            dictDefaultMessage : 'Drop/upload an image'
        });
    drop.on("addedfile", function(file) {
        $("#image-loader").html("<i class='fa fa-spinner fa-spin'></i> Loading images...");
    });

    drop.on("complete", function(file) {

        drop.removeAllFiles(true);
        $("#image-loader").html("");
        var upload_info = jQuery.parseJSON(file.xhr.response);
        var uploaded_filename = upload_info.uploaded_filename;
        var image_path = STATIC_URL + 'uploaded_images/' + uploaded_filename;
        console.log("received_file name" + file.name + " uploaded in " + image_path);
        set_labels_for_image(image_path);
    });
});