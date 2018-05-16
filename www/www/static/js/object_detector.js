//<script>
//## Require label_image_utils
Dropzone.autoDiscover = false;
var IMG_UPLOAD_DIR =  STATIC_URL + 'uploaded_images/raw/';
var OBJECT_LABELS = [];

$(document).ready(function() {
    $("#results").hide();
    var insta_ajax = get_object_labels()
    $.when(insta_ajax).done(function()
	{
        set_drop_zone();
        set_demo_images();
    });

});

function set_demo_images()
{
    var url = "/demo/object_detection/demo_images/";
     $.get(url, function(data, status){
        var image_paths = JSON.parse(data); 
        for(var i in image_paths){
            var img_url  =  STATIC_URL +  image_paths[i];
            var a_img  = $('<a></a>').appendTo("#demo_container");
            // var image_icon = $('<img class="objdet-imgthumb" name="gal_thumb">').appendTo(a_img);
            var image_icon = $('<img class="objdet-imgthumb lazy" name="gal_thumb">').appendTo(a_img);
            // image_icon.attr('src', img_url);
            image_icon.attr('data-original', img_url);
            a_img.click(function(){
                // var image_url  = $(this).find('img').attr('src');
                var image_url  = $(this).find('img').attr('data-original');
                var image_file_name = image_url.substr(image_url.lastIndexOf('/') + 1);
                set_data_for_image(image_url, image_file_name);
            });
        }
        $("img.lazy").lazyload({
            container : $("#demo_container")
        });
    });
}


function disableScrolling(){
    var x=window.scrollX;
    var y=window.scrollY;
    window.onscroll=function(){window.scrollTo(x, y);};
}

//Set drop zone
function set_drop_zone(){
    var drop = new Dropzone("body", {
        dictDefaultMessage: 'or upload your own',
        clickable: 'a.upload',
        url: '/demo/image_upload/'
    });

    drop.on("addedfile", function (file) {
    });

    drop.on("complete", function (file) {
        drop.removeAllFiles(true);
        var upload_info = jQuery.parseJSON(file.xhr.response);
        var image_file_name = upload_info.uploaded_filename;
        var image_url = IMG_UPLOAD_DIR + image_file_name;
        set_data_for_image(image_url, image_file_name);
    });
}

//get the object labels
function get_object_labels()
{
    var url = "/demo/object_detection/get_devkit_data/";
    OBJECT_LABELS = []
    return $.get(url, function(devkit_data, status){
        var dev_data = JSON.parse(devkit_data);
        var devkit_static_path = dev_data['devkit_static_path'] 
        var labels = dev_data['labels']

        for(var i in labels){
            var img_thumb_url  = "";
            if(labels[i].thumb_url !== ""){
                img_thumb_url = devkit_static_path + labels[i].thumb_url
            }
            OBJECT_LABELS.push({'label': labels[i].tag,
                             'value': i,
                             'thumb_url':img_thumb_url});
        }
    });
 
}

function set_data_for_image(image_url, image_file_name){ 
    $("#results").show();
    var annotator_id = create_id(image_file_name);
    var annotation_html = "<div id="+ annotator_id + " class='tile'></div>\
                            <div>\
                            </div>";
    $("#annotator_grid").prepend(annotation_html);
    var url = "/demo/object_detection/detect_objects/";
    $.post(url, JSON.stringify({'image_path': image_url}),  function(data, status){
        if(status== "success"){
            var entries = JSON.parse(data)['objects'];
            console.log(entries)
            var annotator = new BBoxAnnotator({
                url: image_url,
                id: "#" + annotator_id,
                image_label : annotator_id,
                entries: entries,
                width:800,
                height:600,
                border_width : 2,
                labels: OBJECT_LABELS,
                editable : false,
            });
            
        }
    });






   


}

 

