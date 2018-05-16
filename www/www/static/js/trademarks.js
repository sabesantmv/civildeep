//<script>
//## Require label_image_utils
Dropzone.autoDiscover = false;
var SELECTED_CLASSIFIERS = ["trademarks"];
var RES_COUNT = 0;
$(function() {
    var drop = new Dropzone("#tmv-dropzone",
        {
            dictDefaultMessage : 'Drop/upload an image'
        });
        drop.on("addedfile", function(file) {
            set_results_template();
        });
    drop.on("complete", function(file) {
        drop.removeAllFiles(true);
        var upload_info = jQuery.parseJSON(file.xhr.response);
        var uploaded_filename = upload_info.uploaded_filename;
        var image_path = STATIC_URL + 'uploaded_images/trim/' + uploaded_filename;
        set_data_for_image(image_path);
    });
});
                           
function set_results_template(){
        $("#results-group").css({'display':'block'});
        RES_COUNT += 1;
        var labels_container_id = "labels-container" + RES_COUNT;
        var image_container_id = "images-container" + RES_COUNT;
        var main_html = "<div class='flexbox row vstretch dark-border'>\
                         <div class='flex-image' id='" + image_container_id + "' >\
                         Uploading image <i class='fa fa-circle-o-notch fa-spin'></i>\
                         </div>\
                         <div  class='flex-labels' id ='" + labels_container_id +"'>\
                         </div>\
                         </div>";
        $("#results-container").prepend(main_html);
}

//set labels for image
function set_data_for_image(image_path) {

    var image_container_id = "images-container" + RES_COUNT; // div that contains the selected/uploaded image
    var image_id = image_path.replace(/\\/g, '/') // id to set for div hat has selected image as background
    image_id = image_id.substr(image_id.lastIndexOf('/')+1);
    image_id =create_id(image_id);

    //set the results_gropup div to visible
    $("#results_group").css({'display':'block'});
     loadImage(image_path).then(function(){
        $("#" + image_container_id).html("<div id = "+ image_id +" class='box-200'style= background:url(" + image_path + ") 0px 0px></div>");
        var keyword_search_url = "/demo/get_fused_keyword_suggestions/";
        $.post(keyword_search_url, JSON.stringify({'image_path': image_path}), function(data, status){
            if(status == "success")
            {
                var keyword_data = JSON.parse(data);
                set_description(keyword_data);
            }
        });
    
    });
}

function set_description(keyword_data)
{
    var labels_container_id = "labels-container" + RES_COUNT; // div that populate keyword seach labels
    var opt = "description";
    var tree_id = "tree-" + opt + RES_COUNT;
    $("#" + labels_container_id).html("<div class='tree' id='"+ tree_id +"'></div>")
    var progress_divs = [];
    //set the top description
    progress_divs = tree_labels(keyword_data, tree_id, opt, progress_divs)
    ;
    apply_tree_view(tree_id);
    $("#" + tree_id +" ul .parent").toggleClass( 'active' );
    $("#" + tree_id +" ul .parent").children( 'ul' ).slideToggle( "fast", 'linear' );
    $("#" + tree_id +" ul .parent").children('a').children('.progress').addClass('hide');
    apply_progress(progress_divs);
}


//<script>
 